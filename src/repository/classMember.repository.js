import pool from "../config/db.config.js";

export const findByClassId = async (classId) => {
  const result = await pool.query(
    `
            SELECT
                u.id AS member_id,
                u.name,
                u.email,
                cm.joined_at
            FROM class_members AS cm
            INNER JOIN users AS u
                ON cm.member_id = u.id
            WHERE cm.class_id = $1
        `,
    [classId],
  );

  return result.rows;
};

export const findMembership = async (classId, memberId) => {
  const result = await pool.query(
    `
        SELECT class_id, member_id, joined_at
        FROM class_members
        WHERE class_id = $1 AND member_id = $2
    `,
    [classId, memberId],
  );

  return result.rows[0] || null;
};

export const create = async (classId, memberId) => {
  const result = await pool.query(
    `
        INSERT INTO class_members (class_id, member_id) VALUES ($1, $2)
        ON CONFLICT (class_id, member_id) DO NOTHING
        RETURNING class_id, member_id, joined_at
    `,
    [classId, memberId],
  );
  return result.rows[0] || null;
};
