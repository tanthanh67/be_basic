import pool from "../config/db.config.js";

const ASSIGNMENT_COLUMNS =
  "id, class_id, title, description, deadline, maximum_score, created_by, created_at, updated_at";

export const findByClassId = async (classId) => {
  const result = await pool.query(
    `SELECT ${ASSIGNMENT_COLUMNS} FROM assignments WHERE class_id = $1 ORDER BY deadline, id`,
    [classId],
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${ASSIGNMENT_COLUMNS} FROM assignments WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const create = async ({
  classId,
  title,
  description,
  deadline,
  maximumScore,
  createdBy,
}) => {
  const result = await pool.query(
    `
      INSERT INTO assignments (class_id, title, description, deadline, maximum_score, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${ASSIGNMENT_COLUMNS}
    `,
    [classId, title, description ?? null, deadline, maximumScore, createdBy],
  );
  return result.rows[0];
};

export const update = async (
  id,
  { title, description, deadline, maximumScore },
) => {
  const result = await pool.query(
    `
      UPDATE assignments
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          deadline = COALESCE($3, deadline),
          maximum_score = COALESCE($4, maximum_score),
          updated_at = NOW()
      WHERE id = $5
      RETURNING ${ASSIGNMENT_COLUMNS}
    `,
    [
      title ?? null,
      description ?? null,
      deadline ?? null,
      maximumScore ?? null,
      id,
    ],
  );
  return result.rows[0] || null;
};

export const deleteById = async (id) => {
  const result = await pool.query(
    `DELETE FROM assignments WHERE id = $1 RETURNING ${ASSIGNMENT_COLUMNS}`,
    [id],
  );
  return result.rows[0] || null;
};

export const findHighestScore = async (assignmentId) => {
  const result = await pool.query(
    "SELECT MAX(score) AS highest_score FROM submissions WHERE assignment_id = $1",
    [assignmentId],
  );
  return result.rows[0].highest_score;
};
