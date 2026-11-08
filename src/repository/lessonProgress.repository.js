import pool from "../config/db.config.js";

const PROGRESS_COLUMNS = "id, lesson_id, member_id, completed_at";

export const findOne = async (lessonId, memberId) => {
  const result = await pool.query(
    `SELECT ${PROGRESS_COLUMNS} FROM lesson_progress WHERE lesson_id = $1 AND member_id = $2`,
    [lessonId, memberId],
  );
  return result.rows[0] || null;
};

export const create = async (lessonId, memberId) => {
  const result = await pool.query(
    `
      INSERT INTO lesson_progress (lesson_id, member_id)
      VALUES ($1, $2)
      ON CONFLICT (lesson_id, member_id) DO NOTHING
      RETURNING ${PROGRESS_COLUMNS}
    `,
    [lessonId, memberId],
  );
  return result.rows[0] || null;
};

export const countByClass = async (classId, memberId) => {
  const result = await pool.query(
    `
      SELECT
        (SELECT COUNT(*) FROM lessons WHERE class_id = $1)::int AS total_lessons,
        (
          SELECT COUNT(*)
          FROM lesson_progress lp
          JOIN lessons l ON l.id = lp.lesson_id
          WHERE l.class_id = $1 AND lp.member_id = $2
        )::int AS completed_lessons
    `,
    [classId, memberId],
  );
  return result.rows[0];
};
