import pool from "../config/db.config.js";

const LESSON_COLUMNS =
  "id, class_id, title, content, lesson_order, created_by, created_at, updated_at";

export const findByClassId = async (classId, userId) => {
  const result = await pool.query(
    `
      SELECT
        l.id, l.class_id, l.title, l.content, l.lesson_order,
        l.created_by, l.created_at, l.updated_at,
        lp.completed_at
      FROM lessons l
      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id AND lp.member_id = $2
      WHERE l.class_id = $1
      ORDER BY l.lesson_order
    `,
    [classId, userId],
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${LESSON_COLUMNS} FROM lessons WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const findByOrder = async (classId, lessonOrder) => {
  const result = await pool.query(
    `SELECT ${LESSON_COLUMNS} FROM lessons WHERE class_id = $1 AND lesson_order = $2`,
    [classId, lessonOrder],
  );
  return result.rows[0] || null;
};

export const create = async ({
  classId,
  title,
  content,
  lessonOrder,
  createdBy,
}) => {
  const result = await pool.query(
    `
      INSERT INTO lessons (class_id, title, content, lesson_order, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${LESSON_COLUMNS}
    `,
    [classId, title, content ?? null, lessonOrder, createdBy],
  );
  return result.rows[0];
};

export const update = async (id, { title, content, lessonOrder }) => {
  const result = await pool.query(
    `
      UPDATE lessons
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          lesson_order = COALESCE($3, lesson_order),
          updated_at = NOW()
      WHERE id = $4
      RETURNING ${LESSON_COLUMNS}
    `,
    [title ?? null, content ?? null, lessonOrder ?? null, id],
  );
  return result.rows[0] || null;
};

export const deleteById = async (id) => {
  const result = await pool.query(
    `DELETE FROM lessons WHERE id = $1 RETURNING ${LESSON_COLUMNS}`,
    [id],
  );
  return result.rows[0] || null;
};
