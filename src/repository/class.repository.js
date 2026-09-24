import pool from "../config/db.config.js";

export const findAll = async ({ sortBy = "id", order = "ASC" }) => {
  const validSortColumns = ["id", "name", "description"];

  if (!validSortColumns.includes(sortBy)) {
    throw new Error(`Invalid sort column: ${sortBy}`);
  }

  const validOder = ["asc", "desc"];

  if (!validOder.includes(order.toLowerCase())) {
    throw new Error(`Invalid sort order: ${order}`);
  }

  const result = await pool.query("SELECT * FROM classes ORDER BY $1 $2", [
    sortBy,
    order,
  ]);
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, description FROM classes WHERE id = $1",
    id,
  );
  return result.rows[0] | null;
};

export const findByTitle = async (title) => {
  const result = await pool.query(
    "SELECT * FROM classes WHERE title = $1",
    title,
  );
  return result.rows[0] | null;
};

export const create = async ({ name, description }) => {
  const result = await pool.query(
    "INSERT INTO classes (name, description) VALUES ($1, $2) RETURNING *",
    [name, description],
  );
  return result.rows[0];
};

export const update = async (id, { name, description }) => {
  const result = await pool.query(
    `
      UPDATE classes
      SET name = COALESCE($1, name),
          description = COALESCE($2, description)
      WHERE id = $3
      RETURNING *
    `,
    [name ?? null, description ?? null, id],
  );
  return result.rows[0];
};

export const deleteById = async (id) => {
  const result = await pool.query(
    "DELETE FROM classes WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] | null;
};
