import multer from "multer";
import { BadRequestError } from "../core/error.response.js";

export const uploadImg = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestError("Invalid file format! Only images are accepted."),
        false,
      );
    }

    callback(null, true);
  },
});

export const uploadDocs = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new BadRequestError("Invalid file format!"));
    }

    callback(null, true);
  },
});
