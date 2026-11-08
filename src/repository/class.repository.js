import pool from "../config/db.config.js";
import { BadRequestError } from "../core/error.response.js";

export const findAll = async ({ sortBy = "id", order = "ASC" }) => {
  const validSortColumns = [
    "id",
    "name",
    "description",
    "start_date",
    "end_date",
    "mentor_id",
  ];

  if (!validSortColumns.includes(sortBy)) {
    throw new BadRequestError(`Invalid sort column: ${sortBy}`);
  }

  const validOder = ["asc", "desc"];

  if (!validOder.includes(String(order).toLowerCase())) {
    throw new BadRequestError(`Invalid sort order: ${order}`);
  }

  const result = await pool.query(
    `SELECT id, name, description, start_date, end_date, mentor_id FROM classes ORDER BY ${sortBy} ${order}`,
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, description, start_date, end_date, mentor_id FROM classes WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
};

export const findByName = async (name) => {
  const result = await pool.query("SELECT * FROM classes WHERE name = $1", [
    name,
  ]);
  return result.rows[0] || null;
};

export const create = async ({
  name,
  description,
  startDate,
  endDate,
  mentorId,
}) => {
  const result = await pool.query(
    "INSERT INTO classes (name, description, start_date, end_date, mentor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, description, startDate, endDate, mentorId],
  );
  return result.rows[0];
};

export const update = async (
  id,
  { name, description, startDate, endDate, mentorId },
) => {
  const result = await pool.query(
    `
      UPDATE classes
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          mentor_id = COALESCE($5, mentor_id),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `,
    [
      name ?? null,
      description ?? null,
      startDate ?? null,
      endDate ?? null,
      mentorId ?? null,
      id,
    ],
  );
  return result.rows[0];
};

export const deleteById = async (id) => {
  const result = await pool.query(
    "DELETE FROM classes WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] || null;
};
