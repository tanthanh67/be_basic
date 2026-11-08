import * as lessonService from "../services/lesson.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getLessonsByClass = catchAsync(async (req, res) => {
  const lessons = await lessonService.getLessonsByClass(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(res, 200, "Lessons retrieved successfully", lessons);
});

export const createLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.createLesson(
    req.params.id,
    req.user.id,
    req.body,
  );

  return sendSuccess(res, 201, "Lesson created successfully", lesson);
});

export const getLessonById = catchAsync(async (req, res) => {
  const lesson = await lessonService.getLessonById(req.params.id, req.user.id);

  return sendSuccess(res, 200, "Lesson retrieved successfully", lesson);
});

export const updateLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.updateLesson(
    req.params.id,
    req.user.id,
    req.body,
  );

  return sendSuccess(res, 200, "Lesson updated successfully", lesson);
});

export const deleteLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.deleteLesson(req.params.id, req.user.id);

  return sendSuccess(res, 200, "Lesson deleted successfully", lesson);
});

export const completeLesson = catchAsync(async (req, res) => {
  const progress = await lessonService.completeLesson(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(res, 200, "Lesson marked as completed", progress);
});

export const getClassProgress = catchAsync(async (req, res) => {
  const progress = await lessonService.getClassProgress(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(res, 200, "Progress retrieved successfully", progress);
});
