const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const id = { type: "integer", minimum: 1, example: 1 };
const timestamp = {
  type: "string",
  format: "date-time",
  example: "2026-11-12T08:00:00.000Z",
};
const nullableId = { ...id, nullable: true };
const nullableText = { type: "string", nullable: true };
const nullableTimestamp = { ...timestamp, nullable: true };
const userFields = {
  name: { type: "string", minLength: 2, maxLength: 50, example: "Nguyễn Văn An" },
  email: { type: "string", format: "email", example: "an@example.com" },
  age: { type: "integer", minimum: 1, maximum: 120, example: 20 },
};
const password = {
  type: "string",
  format: "password",
  writeOnly: true,
  minLength: 8,
  description: "Ít nhất 8 ký tự, gồm chữ thường, chữ hoa, chữ số và ký tự đặc biệt.",
  example: "Demo@12345",
};
const classFields = {
  name: { type: "string", minLength: 2, maxLength: 100, example: "Backend Node.js" },
  description: { type: "string", maxLength: 500, example: "Lớp học Express và PostgreSQL" },
  startDate: { type: "string", format: "date", example: "2026-12-01" },
  endDate: {
    type: "string",
    format: "date",
    description: "Không được trước startDate.",
    example: "2027-03-01",
  },
  mentorId: id,
};
const lessonFields = {
  title: { type: "string", minLength: 1, maxLength: 255, example: "Giới thiệu Express" },
  content: { type: "string", example: "Router, middleware và xử lý request." },
  order: { ...id, description: "Thứ tự bài học, duy nhất trong lớp." },
};
const assignmentFields = {
  title: { type: "string", minLength: 1, maxLength: 255, example: "Xây dựng REST API" },
  description: { type: "string", example: "Viết API quản lý người dùng." },
  deadline: { ...timestamp, example: "2027-02-01T16:59:59.000Z" },
  maximumScore: { type: "number", minimum: 0, exclusiveMinimum: true, maximum: 10, example: 10 },
};

const schemas = {
  SuccessResponse: {
    type: "object",
    required: ["statusCode", "message", "data"],
    properties: {
      statusCode: { type: "integer", example: 200 },
      message: { type: "string", example: "Success" },
      data: {},
    },
  },
  ErrorResponse: {
    type: "object",
    required: ["statusCode", "message"],
    properties: {
      statusCode: { type: "integer", example: 400 },
      message: { type: "string", example: "Validation failed" },
      errors: {
        type: "array",
        description: "Chỉ có khi lỗi từ bộ kiểm tra dữ liệu đầu vào.",
        items: {
          type: "object",
          required: ["message"],
          properties: {
            field: { type: "string", example: "email" },
            message: { type: "string", example: "Email is not valid" },
          },
        },
      },
    },
  },
  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      ...userFields,
      password: { ...password, minLength: 6, description: "Ít nhất 6 ký tự." },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: userFields.email,
      password: { type: "string", format: "password", writeOnly: true, example: "Demo@12345" },
    },
  },
  RefreshRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", minLength: 1, description: "data.refreshToken nhận được khi đăng nhập." },
    },
  },
  CreateUserRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: { ...userFields, password },
  },
  UpdateUserRequest: { type: "object", properties: { ...userFields, password } },
  User: {
    type: "object",
    properties: {
      id,
      name: userFields.name,
      email: userFields.email,
      age: { ...userFields.age, nullable: true },
      created_at: timestamp,
      updated_at: timestamp,
    },
  },
  AuthUser: {
    allOf: [ref("User"), {
      type: "object",
      properties: { roles: { type: "array", items: { type: "string" }, example: ["MEMBER"] } },
    }],
  },
  LoginData: {
    type: "object",
    properties: {
      user: ref("AuthUser"),
      accessToken: { type: "string", description: "JWT dùng với Authorization: Bearer <token>." },
      refreshToken: { type: "string", description: "JWT dùng trong body của POST /auth/refresh." },
    },
  },
  AccessTokenData: { type: "object", properties: { accessToken: { type: "string" } } },
  CreateClassRequest: {
    type: "object",
    required: ["name", "startDate", "endDate"],
    properties: classFields,
  },
  UpdateClassRequest: { type: "object", properties: classFields },
  Class: {
    type: "object",
    properties: {
      id,
      name: classFields.name,
      description: { ...classFields.description, nullable: true },
      start_date: classFields.startDate,
      end_date: { ...classFields.endDate, nullable: true },
      mentor_id: nullableId,
      created_at: timestamp,
      updated_at: timestamp,
    },
  },
  AddClassMemberRequest: { type: "object", required: ["memberId"], properties: { memberId: id } },
  Membership: {
    type: "object",
    properties: { class_id: id, member_id: id, joined_at: timestamp },
  },
  ClassMember: {
    type: "object",
    properties: { member_id: id, name: userFields.name, email: userFields.email, joined_at: timestamp },
  },
  CreateLessonRequest: { type: "object", required: ["title", "order"], properties: lessonFields },
  UpdateLessonRequest: { type: "object", properties: lessonFields },
  Lesson: {
    type: "object",
    properties: {
      id,
      class_id: id,
      title: lessonFields.title,
      content: nullableText,
      lesson_order: id,
      created_by: nullableId,
      created_at: timestamp,
      updated_at: timestamp,
    },
  },
  LessonWithProgress: {
    allOf: [ref("Lesson"), {
      type: "object",
      properties: { completed_at: nullableTimestamp },
    }],
  },
  LessonProgress: {
    type: "object",
    properties: { id, lesson_id: id, member_id: id, completed_at: timestamp },
  },
  ClassProgress: {
    type: "object",
    properties: {
      totalLessons: { type: "integer", minimum: 0, example: 10 },
      completedLessons: { type: "integer", minimum: 0, example: 3 },
      progress: { type: "integer", minimum: 0, maximum: 100, description: "Phần trăm hoàn thành, làm tròn tới số nguyên.", example: 30 },
    },
  },
  CreateAssignmentRequest: {
    type: "object",
    required: ["title", "deadline", "maximumScore"],
    properties: assignmentFields,
  },
  UpdateAssignmentRequest: { type: "object", properties: assignmentFields },
  Assignment: {
    type: "object",
    properties: {
      id,
      class_id: id,
      title: assignmentFields.title,
      description: nullableText,
      deadline: assignmentFields.deadline,
      maximum_score: assignmentFields.maximumScore,
      created_by: nullableId,
      created_at: timestamp,
      updated_at: timestamp,
    },
  },
  SubmitAssignmentRequest: {
    type: "object",
    description: "Cần ít nhất một trong content hoặc repositoryUrl có giá trị không rỗng.",
    anyOf: [
      { required: ["content"], properties: { content: { type: "string", minLength: 1 } } },
      { required: ["repositoryUrl"] },
    ],
    properties: {
      content: { type: "string", example: "Bài làm của tôi" },
      repositoryUrl: { type: "string", format: "uri", pattern: "^https?://", maxLength: 2048, example: "https://github.com/example/rest-api" },
    },
  },
  ReviewSubmissionRequest: {
    type: "object",
    required: ["score"],
    properties: {
      score: { type: "number", minimum: 0, maximum: 10, description: "Không vượt quá maximum_score của bài tập.", example: 8.5 },
      feedback: { type: "string", example: "Bài làm tốt, cần bổ sung xử lý lỗi." },
    },
  },
  Submission: {
    type: "object",
    properties: {
      id,
      assignment_id: id,
      member_id: id,
      content: nullableText,
      repository_url: { type: "string", format: "uri", nullable: true },
      submitted_at: timestamp,
      score: { type: "number", minimum: 0, maximum: 10, nullable: true },
      feedback: nullableText,
      reviewed_at: nullableTimestamp,
      reviewed_by: nullableId,
    },
  },
  SubmissionWithMember: {
    allOf: [ref("Submission"), {
      type: "object",
      description: "member_name và member_email được bổ sung khi mentor hoặc người có quyền xem tất cả lấy danh sách.",
      properties: { member_name: userFields.name, member_email: userFields.email },
    }],
  },
};

const success = (schema, statusCode = 200) => ({
  description: statusCode === 201 ? "Tạo thành công" : "Thành công",
  content: {
    "application/json": {
      schema: {
        allOf: [ref("SuccessResponse"), {
          type: "object",
          properties: { statusCode: { type: "integer", enum: [statusCode], example: statusCode }, data: schema },
        }],
      },
    },
  },
});
const list = (name) => ({ type: "array", items: ref(name) });
const error = (statusCode, description, message) => ({
  description,
  content: {
    "application/json": { schema: ref("ErrorResponse"), example: { statusCode, message } },
  },
});

export default {
  securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  schemas,
  parameters: {
    Id: { name: "id", in: "path", required: true, description: "ID của tài nguyên trong đường dẫn.", schema: id },
    MemberId: { name: "memberId", in: "path", required: true, description: "ID của thành viên.", schema: id },
    SortOrder: {
      name: "order",
      in: "query",
      description: "Thứ tự sắp xếp, không phân biệt chữ hoa và chữ thường.",
      schema: { type: "string", enum: ["ASC", "DESC", "asc", "desc"], default: "ASC" },
    },
  },
  responses: {
    BadRequest: error(400, "Dữ liệu đầu vào không hợp lệ hoặc vi phạm quy tắc nghiệp vụ", "Validation failed"),
    Unauthorized: error(401, "Thiếu token, token không hợp lệ hoặc đã hết hạn", "Missing or invalid authorization header"),
    Forbidden: error(403, "Thiếu quyền hoặc không có quyền truy cập lớp/tài nguyên", "User does not have the required permission"),
    NotFound: error(404, "Không tìm thấy tài nguyên", "Resource not found"),
    Conflict: error(409, "Tài nguyên đã tồn tại hoặc bị trùng", "Resource already exists"),
    InternalServerError: error(500, "Lỗi máy chủ", "Internal Server Error"),
    User: success(ref("User")),
    UserCreated: success(ref("User"), 201),
    UserList: success(list("User")),
    AuthUser: success(ref("AuthUser")),
    Login: {
      ...success(ref("LoginData")),
      headers: { "Set-Cookie": { description: "Cookie refresh có HttpOnly; API refresh vẫn nhận refreshToken từ JSON body.", schema: { type: "string" } } },
    },
    AccessToken: success(ref("AccessTokenData")),
    Class: success(ref("Class")),
    ClassCreated: success(ref("Class"), 201),
    ClassList: success(list("Class")),
    ClassMemberList: success(list("ClassMember")),
    Membership: success(ref("Membership")),
    MembershipCreated: success(ref("Membership"), 201),
    Lesson: success(ref("Lesson")),
    LessonCreated: success(ref("Lesson"), 201),
    LessonList: success(list("LessonWithProgress")),
    LessonProgress: success(ref("LessonProgress")),
    ClassProgress: success(ref("ClassProgress")),
    Assignment: success(ref("Assignment")),
    AssignmentCreated: success(ref("Assignment"), 201),
    AssignmentList: success(list("Assignment")),
    Submission: success(ref("Submission")),
    SubmissionCreated: success(ref("Submission"), 201),
    SubmissionList: success(list("SubmissionWithMember")),
  },
};
