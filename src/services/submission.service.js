import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../core/error.response.js";
import * as submissionRepository from "../repository/submission.repository.js";
import { ensureMember, ensureMentor } from "./classAccess.service.js";
import { findAssignmentWithAccess } from "./assignment.service.js";

export const submitAssignment = async (
  assignmentId,
  userId,
  { content, repositoryUrl },
) => {
  const { assignment, access } = await findAssignmentWithAccess(
    assignmentId,
    userId,
  );
  ensureMember(access);

  if (new Date() > new Date(assignment.deadline)) {
    throw new BadRequestError("The deadline for this assignment has passed");
  }

  const submission = await submissionRepository.create({
    assignmentId: assignment.id,
    memberId: userId,
    content,
    repositoryUrl,
  });
  if (!submission) {
    throw new ConflictError("You have already submitted this assignment");
  }

  return submission;
};

export const getSubmissionsByAssignment = async (assignmentId, userId) => {
  const { assignment, access } = await findAssignmentWithAccess(
    assignmentId,
    userId,
  );

  if (access.isMentor || access.canReadAll) {
    return submissionRepository.findByAssignmentId(assignment.id);
  }

  if (access.isMember) {
    const ownSubmission = await submissionRepository.findByAssignmentAndMember(
      assignment.id,
      userId,
    );
    return ownSubmission ? [ownSubmission] : [];
  }

  throw new ForbiddenError("You do not have access to this class");
};

export const getSubmissionById = async (submissionId, userId) => {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const { access } = await findAssignmentWithAccess(
    submission.assignment_id,
    userId,
  );

  const isOwner = submission.member_id === userId;
  if (!isOwner && !access.isMentor && !access.canReadAll) {
    throw new ForbiddenError("You do not have access to this submission");
  }

  return submission;
};

export const reviewSubmission = async (
  submissionId,
  userId,
  { score, feedback },
) => {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const { assignment, access } = await findAssignmentWithAccess(
    submission.assignment_id,
    userId,
  );
  ensureMentor(access);

  if (score > assignment.maximum_score) {
    throw new BadRequestError(
      `Score cannot be greater than the maximum score (${assignment.maximum_score})`,
    );
  }

  return submissionRepository.review(submission.id, {
    score,
    feedback,
    reviewerId: userId,
  });
};
