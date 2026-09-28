import pool from "../config/db.config.js";

export const findAll = async ({ sortBy = "id", order = "ASC" }) => {
  const validSortColumns = ["id", "title", "content", "lesson_order"];

  if (!validSortColumns.includes(sortBy)) {
    throw new Error(`Invalid sort column: ${sortBy}`);
  }

  const validOder = ["asc", "desc"];

  if (!validOder.includes(order.toLowerCase())) {
    throw new Error(`Invalid sort order: ${order}`);
  }

  const result = await pool.query(
    `SELECT * FROM lessons ORDER BY ${sortBy} ${order}`,
  );
  return result.rows;
};

export const create = async ({ class_id, title, content, lesson_order }) => {
  const result = await pool.query(
    "INSERT INTO lessons (class_id, title, content, lesson_order) VALUES ($1, $2, $3, $4) RETURNING *",
    [class_id, title, content, lesson_order],
  );
  return result.rows[0];
};
