import { BadRequestError, NotFoundError } from "../core/error.response.js";
import * as assignmentRepository from "../repository/assignment.repository.js";
import {
  ensureCanView,
  ensureMentor,
  getClassAccess,
} from "./classAccess.service.js";

export const findAssignmentWithAccess = async (assignmentId, userId) => {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) {
    throw new NotFoundError("Assignment not found");
  }

  const access = await getClassAccess(assignment.class_id, userId);
  return { assignment, access };
};

export const getAssignmentsByClass = async (classId, userId) => {
  const access = await getClassAccess(classId, userId);
  ensureCanView(access);

  return assignmentRepository.findByClassId(classId);
};

export const createAssignment = async (
  classId,
  userId,
  { title, description, deadline, maximumScore },
) => {
  const access = await getClassAccess(classId, userId);
  ensureMentor(access);

  return assignmentRepository.create({
    classId,
    title,
    description,
    deadline,
    maximumScore,
    createdBy: userId,
  });
};

export const getAssignmentById = async (assignmentId, userId) => {
  const { assignment, access } = await findAssignmentWithAccess(
    assignmentId,
    userId,
  );
  ensureCanView(access);

  return assignment;
};

export const updateAssignment = async (assignmentId, userId, data) => {
  const { assignment, access } = await findAssignmentWithAccess(
    assignmentId,
    userId,
  );
  ensureMentor(access);

  if (data.maximumScore !== undefined) {
    const highestScore = await assignmentRepository.findHighestScore(
      assignment.id,
    );
    if (highestScore !== null && data.maximumScore < highestScore) {
      throw new BadRequestError(
        "Maximum score cannot be lower than an existing submission score",
      );
    }
  }

  return assignmentRepository.update(assignment.id, data);
};

export const deleteAssignment = async (assignmentId, userId) => {
  const { assignment, access } = await findAssignmentWithAccess(
    assignmentId,
    userId,
  );
  ensureMentor(access);

  return assignmentRepository.deleteById(assignment.id);
};
