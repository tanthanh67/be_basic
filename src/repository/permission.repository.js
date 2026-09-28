import pool from "../config/db.config.js";

export const hasPermission = async (userId, permission) => {
  const result = await pool.query(
    `
            SELECT EXISTS (
                SELECT 1 
                FROM user_roles ur
                JOIN role_permissions rp
                    ON rp.role_id = ur.role_id
                JOIN permissions p
                    ON p.id = rp.permission_id
                WHERE ur.user_id = $1
                    AND p.name = $2
            ) AS has_permission
        `,
    [userId, permission],
  );

  return result.rows[0].has_permission;
};
