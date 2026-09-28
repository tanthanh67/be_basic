import pool from "../config/db.config.js";

export const create = async ({
  key,
  url,
  originalName,
  mimeType,
  size,
  uploadedBy,
}) => {
  const result = await pool.query(
    `
        INSERT INTO uploads (r2_key, url, original_name, mime_type, size_bytes, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
    `,
    [key, url, originalName, mimeType, size, uploadedBy],
  );

  return result.rows[0];
};

export const createMany = async (files) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const records = [];

    for (const file of files) {
      const result = await client.query(
        `
            INSERT INTO uploads (r2_key, url, original_name, mime_type, size_bytes, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `,
        [
          file.key,
          file.url,
          file.originalName,
          file.mimeType,
          file.size,
          file.uploadedBy,
        ],
      );
      records.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return records;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
