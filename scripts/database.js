import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const sqlDirectory = new URL("../db/init/", import.meta.url);
export const seedFiles = ["02_seed.sql", "03_admin.sql"];

export const isMain = (url) =>
  Boolean(process.argv[1]) && fileURLToPath(url) === resolve(process.argv[1]);

export const readSqlFiles = async (directory = sqlDirectory) => {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".sql"));
  for (const name of names) {
    if (!/^\d{2,}_[a-z0-9_]+\.sql$/.test(name)) {
      throw new Error(`Invalid SQL filename: ${name}. Use 04_describe_change.sql.`);
    }
  }
  names.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const versions = names.map((name) => Number(name.split("_")[0]));
  if (new Set(versions).size !== versions.length) {
    throw new Error("SQL filenames must have unique version numbers.");
  }
  return Promise.all(names.map(async (name) => {
    const sql = (await readFile(new URL(name, directory), "utf8")).replace(/\r\n/g, "\n");
    return { name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
};

// Migration and seed commands share a lock, including across separate processes.
export const withDatabaseLock = async (client, task) => {
  await client.query("SELECT pg_advisory_lock(739241, 1)");
  try {
    return await task();
  } finally {
    await client.query("SELECT pg_advisory_unlock(739241, 1)");
  }
};

export const runCommand = async (task) => {
  const [{ default: pg }, { config }] = await Promise.all([
    import("pg"),
    import("../src/config/env.config.js"),
  ]);
  const client = new pg.Client({ ...config.db, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await task(client);
  } catch (error) {
    console.error(`Database command failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};
