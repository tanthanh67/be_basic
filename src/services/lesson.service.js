import { ConflictError, NotFoundError } from "../core/error.response.js";
import * as lessonRepository from "../repository/lesson.repository.js";
import * as lessonProgressRepository from "../repository/lessonProgress.repository.js";
import {
  ensureCanView,
  ensureMember,
  ensureMentor,
  getClassAccess,
} from "./classAccess.service.js";

const findLessonWithAccess = async (lessonId, userId) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw new NotFoundError("Lesson not found");
  }

  const access = await getClassAccess(lesson.class_id, userId);
  return { lesson, access };
};

const ensureOrderAvailable = async (classId, lessonOrder, currentLessonId) => {
  const sameOrderLesson = await lessonRepository.findByOrder(
    classId,
    lessonOrder,
  );
  if (sameOrderLesson && sameOrderLesson.id !== currentLessonId) {
    throw new ConflictError("Lesson order already exists in this class");
  }
};

export const getLessonsByClass = async (classId, userId) => {
  const access = await getClassAccess(classId, userId);
  ensureCanView(access);

  return lessonRepository.findByClassId(classId, userId);
};

export const createLesson = async (classId, userId, { title, content, order }) => {
  const access = await getClassAccess(classId, userId);
  ensureMentor(access);

  await ensureOrderAvailable(classId, order);

  return lessonRepository.create({
    classId,
    title,
    content,
    lessonOrder: order,
    createdBy: userId,
  });
};

export const getLessonById = async (lessonId, userId) => {
  const { lesson, access } = await findLessonWithAccess(lessonId, userId);
  ensureCanView(access);

  return lesson;
};

export const updateLesson = async (lessonId, userId, { title, content, order }) => {
  const { lesson, access } = await findLessonWithAccess(lessonId, userId);
  ensureMentor(access);

  if (order !== undefined && order !== lesson.lesson_order) {
    await ensureOrderAvailable(lesson.class_id, order, lesson.id);
  }

  return lessonRepository.update(lesson.id, {
    title,
    content,
    lessonOrder: order,
  });
};

export const deleteLesson = async (lessonId, userId) => {
  const { lesson, access } = await findLessonWithAccess(lessonId, userId);
  ensureMentor(access);

  return lessonRepository.deleteById(lesson.id);
};

export const completeLesson = async (lessonId, userId) => {
  const { lesson, access } = await findLessonWithAccess(lessonId, userId);
  ensureMember(access);

  const progress = await lessonProgressRepository.create(lesson.id, userId);
  return progress ?? lessonProgressRepository.findOne(lesson.id, userId);
};

export const getClassProgress = async (classId, userId) => {
  const access = await getClassAccess(classId, userId);
  ensureMember(access);

  const { total_lessons: totalLessons, completed_lessons: completedLessons } =
    await lessonProgressRepository.countByClass(classId, userId);

  const progress =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return { totalLessons, completedLessons, progress };
};
