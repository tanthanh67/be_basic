import pool from "../config/db.config.js";
import { BadRequestError } from "../core/error.response.js";

const PUBLIC_COLUMNS = "id, name, email, age, created_at, updated_at";

export const findAll = async ({ sortBy = "id", order = "ASC" }) => {
  const validSortColumns = ["id", "name", "email"];

  if (!validSortColumns.includes(sortBy)) {
    throw new BadRequestError(`Invalid sort column: ${sortBy}`);
  }

  const validOder = ["asc", "desc"];

  if (!validOder.includes(String(order).toLowerCase())) {
    throw new BadRequestError(`Invalid sort order: ${order}`);
  }

  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY ${sortBy} ${order}`,
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const hasRole = async (userId, roleName) => {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1 AND r.name = $2
      ) AS has_role
    `,
    [userId, roleName],
  );

  return result.rows[0].has_role;
};

export const findByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] || null;
};

export const create = async ({ name, email, password, age }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, age) VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
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
          age = COALESCE($4, age),
          updated_at = NOW()
      WHERE id = $5
      RETURNING ${PUBLIC_COLUMNS}
    `,
    [name ?? null, email ?? null, password ?? null, age ?? null, id],
  );
  return result.rows[0] || null;
};

export const deleteById = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id],
  );
  return result.rows[0] || null;
};

export const createWithRole = async (
  { name, email, password, age },
  roleName,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, age) VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
      [name, email, password, age],
    );
    const user = userResult.rows[0];

    const roleResult = await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = $2`,
      [user.id, roleName],
    );

    if (roleResult.rowCount !== 1) {
      throw new Error(`Role '${roleName}' does not exist`);
    }

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findRoleNames = async (userId) => {
  const result = await pool.query(
    `
      SELECT r.name
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.name
    `,
    [userId],
  );
  return result.rows.map((row) => row.name);
};
