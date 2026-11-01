import * as uploadService from "../services/upload.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const uploadImage = catchAsync(async (req, res) => {
  const result = await uploadService.uploadImage(req.file, req.user.id);

  return sendSuccess(res, 201, "Image uploaded successfully", result);
});

export const deleteImage = catchAsync(async (req, res) => {
  const { key } = req.body;

  await uploadService.deleteImgFromR2(key);
  return sendSuccess(res, 200, "Image deleted successfully");
});

export const uploadDocuments = catchAsync(async (req, res) => {
  const records = await uploadService.uploadDocuments(req.files, req.user.id);
  return sendSuccess(res, 201, "Documents uploaded successfully", records);
});

export const getFileUrl = catchAsync(async (req, res) => {
  const result = await uploadService.getFileUrl(req.params.id, req.user.id);

  res.set("Cache-Control", "no-store");

  return sendSuccess(res, 200, "File URL generated successfully", result);
});
