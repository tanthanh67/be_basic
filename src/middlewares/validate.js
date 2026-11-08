import { validationResult, body, param } from "express-validator";
import { BadRequestError } from "../core/error.response.js";

export const validate = (rules) => {
  return async (req, res, next) => {
    // Chạy tuần tự từng rule
    for (const rule of rules) {
      await rule.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Gộp tất cả lỗi thành mảng { field, message }
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    // Ném BadRequestError kèm danh sách lỗi chi tiết
    const error = new BadRequestError("Validation failed");
    error.errors = formattedErrors;
    return next(error);
  };
};

export const memberIdParamRules = [
  param("memberId")
    .trim()
    .notEmpty()
    .withMessage("Member ID is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Member ID must be a positive integer")
    .toInt(),
];

export const addClassMemberRules = [
  body("memberId")
    .notEmpty()
    .withMessage("memberId không được để trống")
    .bail()
    .isInt({ min: 1 })
    .withMessage("memberId phải là số nguyên dương")
    .toInt(),
];

export const idParamRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("ID is required")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
    .toInt(),
];

export const createUserRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .trim()
    .isStrongPassword()
    .withMessage("Password is not strong"),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be an integer between 1 and 120"),
];

export const updateUserRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),

  body("password")
    .optional()
    .trim()
    .isStrongPassword()
    .withMessage("Password is not strong"),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be an integer between 1 and 120"),
];

export const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ min: 2, max: 50 })
    .withMessage("Tên phải từ 2 đến 50 ký tự"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không đúng định dạng")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có tối thiểu 6 ký tự"),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Tuổi phải là số nguyên từ 1 đến 120"),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không đúng định dạng")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Mật khẩu không được để trống"),
];

// Only accept real calendar dates in YYYY-MM-DD form (rejects 2026-02-30 and date-times).
const DATE_FORMAT = { format: "YYYY-MM-DD", strictMode: true, delimiters: ["-"] };

// endDate must not be before startDate when both are in the request body.
// When only one of them is sent (update), the service compares against the stored value.
const isNotBeforeStartDate = (endDate, { req }) => {
  const startDate = req.body.startDate;
  if (startDate && endDate < startDate) {
    return false;
  }
  return true;
};

export const createClassRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên lớp không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên lớp phải từ 2 đến 100 ký tự"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Mô tả không được vượt quá 500 ký tự"),

  body("startDate")
    .trim()
    .notEmpty()
    .withMessage("Ngày bắt đầu không được để trống")
    .bail()
    .isDate(DATE_FORMAT)
    .withMessage("Ngày bắt đầu phải là ngày hợp lệ dạng YYYY-MM-DD"),

  body("endDate")
    .trim()
    .notEmpty()
    .withMessage("Ngày kết thúc không được để trống")
    .bail()
    .isDate(DATE_FORMAT)
    .withMessage("Ngày kết thúc phải là ngày hợp lệ dạng YYYY-MM-DD")
    .bail()
    .custom(isNotBeforeStartDate)
    .withMessage("Ngày kết thúc không được trước ngày bắt đầu"),

  body("mentorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID của mentor phải là số nguyên dương"),
];

export const updateClassRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên lớp phải từ 2 đến 100 ký tự"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Mô tả không được vượt quá 500 ký tự"),
  body("startDate")
    .optional()
    .trim()
    .isDate(DATE_FORMAT)
    .withMessage("Ngày bắt đầu phải là ngày hợp lệ dạng YYYY-MM-DD"),
  body("endDate")
    .optional()
    .trim()
    .isDate(DATE_FORMAT)
    .withMessage("Ngày kết thúc phải là ngày hợp lệ dạng YYYY-MM-DD")
    .bail()
    .custom(isNotBeforeStartDate)
    .withMessage("Ngày kết thúc không được trước ngày bắt đầu"),
  body("mentorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID của mentor phải là số nguyên dương"),
];

export const createLessonRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề không được để trống")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Tiêu đề không được vượt quá 255 ký tự"),

  body("content")
    .optional()
    .isString()
    .withMessage("Nội dung phải là chuỗi"),

  body("order")
    .notEmpty()
    .withMessage("Thứ tự bài học không được để trống")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Thứ tự bài học phải là số nguyên dương")
    .toInt(),
];

export const updateLessonRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề không được để trống")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Tiêu đề không được vượt quá 255 ký tự"),

  body("content")
    .optional()
    .isString()
    .withMessage("Nội dung phải là chuỗi"),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Thứ tự bài học phải là số nguyên dương")
    .toInt(),
];

export const createAssignmentRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề không được để trống")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Tiêu đề không được vượt quá 255 ký tự"),

  body("description")
    .optional()
    .isString()
    .withMessage("Mô tả phải là chuỗi"),

  body("deadline")
    .notEmpty()
    .withMessage("Deadline không được để trống")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Deadline phải là ngày giờ hợp lệ theo chuẩn ISO 8601"),

  body("maximumScore")
    .notEmpty()
    .withMessage("Điểm tối đa không được để trống")
    .bail()
    .isFloat({ gt: 0, max: 10 })
    .withMessage("Điểm tối đa phải lớn hơn 0 và không quá 10")
    .toFloat(),
];

export const updateAssignmentRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề không được để trống")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Tiêu đề không được vượt quá 255 ký tự"),

  body("description")
    .optional()
    .isString()
    .withMessage("Mô tả phải là chuỗi"),

  body("deadline")
    .optional()
    .isISO8601({ strict: true })
    .withMessage("Deadline phải là ngày giờ hợp lệ theo chuẩn ISO 8601"),

  body("maximumScore")
    .optional()
    .isFloat({ gt: 0, max: 10 })
    .withMessage("Điểm tối đa phải lớn hơn 0 và không quá 10")
    .toFloat(),
];
