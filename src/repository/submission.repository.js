import pool from "../config/db.config.js";

const SUBMISSION_COLUMNS =
  "id, assignment_id, member_id, content, repository_url, submitted_at, score, feedback, reviewed_at, reviewed_by";

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${SUBMISSION_COLUMNS} FROM submissions WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const findByAssignmentId = async (assignmentId) => {
  const result = await pool.query(
    `
      SELECT
        s.id, s.assignment_id, s.member_id, s.content, s.repository_url, s.submitted_at,
        s.score, s.feedback, s.reviewed_at, s.reviewed_by,
        u.name AS member_name, u.email AS member_email
      FROM submissions s
      JOIN users u ON u.id = s.member_id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at
    `,
    [assignmentId],
  );
  return result.rows;
};

export const findByAssignmentAndMember = async (assignmentId, memberId) => {
  const result = await pool.query(
    `SELECT ${SUBMISSION_COLUMNS} FROM submissions WHERE assignment_id = $1 AND member_id = $2`,
    [assignmentId, memberId],
  );
  return result.rows[0] || null;
};

export const create = async ({
  assignmentId,
  memberId,
  content,
  repositoryUrl,
}) => {
  const result = await pool.query(
    `
      INSERT INTO submissions (assignment_id, member_id, content, repository_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (assignment_id, member_id) DO NOTHING
      RETURNING ${SUBMISSION_COLUMNS}
    `,
    [assignmentId, memberId, content ?? null, repositoryUrl ?? null],
  );
  return result.rows[0] || null;
};

export const review = async (id, { score, feedback, reviewerId }) => {
  const result = await pool.query(
    `
      UPDATE submissions
      SET score = $1,
          feedback = COALESCE($2, feedback),
          reviewed_at = NOW(),
          reviewed_by = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING ${SUBMISSION_COLUMNS}
    `,
    [score, feedback ?? null, reviewerId, id],
  );
  return result.rows[0] || null;
};
