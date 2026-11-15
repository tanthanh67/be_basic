import { randomUUID } from "node:crypto";
import {
  isMain,
  readSqlFiles,
  runCommand,
  seedFiles,
  sqlDirectory,
  withDatabaseLock,
} from "./database.js";

// Read structure only; no application rows are read or changed when baselining.
const describeSchema = async (client, schema) => {
  const { rows } = await client.query(`
    SELECT c.relname AS name,
      (SELECT jsonb_agg(jsonb_build_object(
        'name', a.attname, 'type', format_type(a.atttypid, a.atttypmod),
        'required', a.attnotnull, 'identity', a.attidentity,
        'default', pg_get_expr(d.adbin, d.adrelid)
      ) ORDER BY a.attnum)
       FROM pg_attribute a
       LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
       WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped) AS columns,
      (SELECT jsonb_agg(pg_get_constraintdef(k.oid) ORDER BY k.conname)
       FROM pg_constraint k WHERE k.conrelid = c.oid) AS constraints,
      (SELECT jsonb_agg(pg_get_indexdef(i.indexrelid) ORDER BY ic.relname)
       FROM pg_index i JOIN pg_class ic ON ic.oid = i.indexrelid
       WHERE i.indrelid = c.oid) AS indexes
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = $1 AND c.relkind = 'r'
    ORDER BY c.relname
  `, [schema]);
  const normalize = (value) => JSON.stringify(value)
    .replaceAll(`${schema}.`, "")
    .replaceAll("public.", "");
  return new Map(rows.map(({ name, ...structure }) => [name, normalize(structure)]));
};

const baselineExistingSchema = async (client, initialSql) => {
  const reference = `migration_reference_${randomUUID().replaceAll("-", "")}`;
  await client.query(`CREATE SCHEMA "${reference}"`);
  await client.query(`SET LOCAL search_path TO "${reference}"`);
  await client.query(initialSql);
  const expected = await describeSchema(client, reference);
  const actual = await describeSchema(client, "public");
  const mismatches = [...expected].filter(([name, structure]) => actual.get(name) !== structure);
  if (mismatches.length) {
    throw new Error(
      `Existing schema differs from 01_schema.sql: ${mismatches.map(([name]) => name).join(", ")}. ` +
      "Reconcile the schema before retrying; no baseline was recorded.",
    );
  }
  await client.query(`DROP SCHEMA "${reference}" CASCADE`);
  await client.query("SET LOCAL search_path TO public");
};

export const migrate = async (client, { directory = sqlDirectory, log = console.log } = {}) => {
  const files = (await readSqlFiles(directory)).filter((file) => !seedFiles.includes(file.name));
  if (files[0]?.name !== "01_schema.sql") {
    throw new Error("Missing initial migration: db/init/01_schema.sql");
  }

  return withDatabaseLock(client, async () => {
    await client.query("SET search_path TO public");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    const { rows } = await client.query("SELECT name, checksum FROM public.schema_migrations ORDER BY name");
    const applied = new Map(rows.map((row) => [row.name, row.checksum]));
    for (const row of rows) {
      const file = files.find((candidate) => candidate.name === row.name);
      if (!file || file.checksum !== row.checksum) {
        throw new Error(`Applied migration is missing or changed: ${row.name}. Restore it and add a new migration.`);
      }
    }
    const lastApplied = files.reduce((last, file, index) => applied.has(file.name) ? index : last, -1);
    if (files.some((file, index) => index < lastApplied && !applied.has(file.name))) {
      throw new Error("A pending migration precedes an applied migration. Use a new version number.");
    }

    let count = 0;
    for (const file of files) {
      if (applied.has(file.name)) continue;
      await client.query("BEGIN");
      try {
        let baselined = false;
        if (file.name === "01_schema.sql") {
          const { rows: tables } = await client.query(`
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public' AND tablename <> 'schema_migrations'
          `);
          if (tables.length) {
            await baselineExistingSchema(client, file.sql);
            baselined = true;
          }
        }
        if (!baselined) await client.query(file.sql);
        await client.query(
          "INSERT INTO public.schema_migrations (name, checksum) VALUES ($1, $2)",
          [file.name, file.checksum],
        );
        await client.query("COMMIT");
        count += 1;
        log(`${baselined ? "Baselined existing schema" : "Applied"}: ${file.name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    log(count ? `Recorded ${count} migration(s).` : "Database is up to date.");
  });
};

if (isMain(import.meta.url)) await runCommand(migrate);
