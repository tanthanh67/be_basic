import pool from "../config/db.config.js";

export const findAll = async ({ sortBy = "id", order = "ASC" }) => {
  const validSortColumns = ["id", "name", "email"];

  if (!validSortColumns.includes(sortBy)) {
    throw new Error(`Invalid sort column: ${sortBy}`);
  }

  const validOder = ["asc", "desc"];

  if (!validOder.includes(order.toLowerCase())) {
    throw new Error(`Invalid sort order: ${order}`);
  }

  const result = await pool.query("SELECT * FROM users ORDER BY $1 $2", [
    sortBy,
    order,
  ]);
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, age, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
};

export const findByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
};

export const create = async ({ name, email, password, age }) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash, age) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, password, age],
  );
  return result.rows[0] || null;
};

export const update = async (id, { name, email, password, age }) => {
  const result = await pool.query(
    `
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          password_hash = COALESCE($3, password_hash),
          age = COALESCE($4, age)
      WHERE id = $5
      RETURNING *
    `,
    [name ?? null, email ?? null, password ?? null, age ?? null, id],
  );
  return result.rows[0] || null;
};

export const deleteById = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] || null;
};
