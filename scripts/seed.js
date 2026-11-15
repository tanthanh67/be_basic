import {
  isMain,
  readSqlFiles,
  runCommand,
  seedFiles,
  sqlDirectory,
  withDatabaseLock,
} from "./database.js";

export const seed = async (client, { directory = sqlDirectory, log = console.log } = {}) => {
  const files = await readSqlFiles(directory);
  const seeds = seedFiles.map((name) => {
    const file = files.find((candidate) => candidate.name === name);
    if (!file) throw new Error(`Missing seed file: ${name}`);
    return file;
  });

  return withDatabaseLock(client, async () => {
    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL search_path TO public");
      for (const file of seeds) await client.query(file.sql);
      await client.query("COMMIT");
      log(`Seeded: ${seedFiles.join(", ")}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
};

if (isMain(import.meta.url)) await runCommand(seed);
