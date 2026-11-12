import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "node:url";
import components from "../docs/swagger.components.js";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Backend Basic API Documentation",
    version: "1.0.0",
    description: [
      "API quản lý người dùng, lớp học, bài học, bài tập và bài nộp.",
      "Đăng nhập tại POST /auth/login, sao chép data.accessToken rồi dán vào Authorize (chỉ nhập token).",
      "Các API được bảo vệ cần JWT và quyền tương ứng. Đăng ký, đăng nhập và làm mới token là công khai.",
      "Request JSON sử dụng camelCase; dữ liệu trả về từ cơ sở dữ liệu thường sử dụng snake_case.",
    ].join("\n\n"),
  },
  servers: [
    {
      url: "/api",
      description: "API trên cùng máy chủ",
    },
  ],
  tags: [
    { name: "Auth", description: "Đăng ký, đăng nhập và JWT" },
    { name: "Users", description: "Quản lý người dùng" },
    { name: "Classes", description: "Quản lý lớp học" },
    { name: "Class Members", description: "Thành viên lớp học" },
    { name: "Lessons", description: "Bài học và tiến độ học tập" },
    { name: "Assignments", description: "Bài tập của lớp" },
    { name: "Submissions", description: "Nộp bài và chấm điểm" },
  ],
  components,
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Resolve from this module so documentation also loads outside the project cwd.
  apis: ["../docs/*.yaml", "../routes/*.js"].map((path) =>
    fileURLToPath(new URL(path, import.meta.url)).replace(/\\/g, "/"),
  ),
  failOnErrors: true,
};

export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
