import pool from "../config/db.config.js";

const SESSION_COLUMNS = "id, user_id, created_at, expires_at, revoked_at";

export const create = async ({ id, userId, expiresAt }) => {
  const result = await pool.query(
    `INSERT INTO auth_sessions (id, user_id, expires_at)
     VALUES ($1, $2, $3)
     RETURNING ${SESSION_COLUMNS}`,
    [id, userId, expiresAt],
  );

  return result.rows[0];
};

export const findActive = async (sessionId, userId) => {
  const result = await pool.query(
    `SELECT ${SESSION_COLUMNS}
     FROM auth_sessions
     WHERE id = $1
       AND user_id = $2
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [sessionId, userId],
  );

  return result.rows[0] ?? null;
};

export const revoke = async (sessionId, userId) => {
  const result = await pool.query(
    `UPDATE auth_sessions
     SET revoked_at = NOW()
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
     RETURNING ${SESSION_COLUMNS}`,
    [sessionId, userId],
  );

  return result.rows[0] ?? null;
};
