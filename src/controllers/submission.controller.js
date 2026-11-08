import * as submissionService from "../services/submission.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const submitAssignment = catchAsync(async (req, res) => {
  const submission = await submissionService.submitAssignment(
    req.params.id,
    req.user.id,
    req.body,
  );

  return sendSuccess(res, 201, "Assignment submitted successfully", submission);
});

export const getSubmissionsByAssignment = catchAsync(async (req, res) => {
  const submissions = await submissionService.getSubmissionsByAssignment(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(
    res,
    200,
    "Submissions retrieved successfully",
    submissions,
  );
});

export const getSubmissionById = catchAsync(async (req, res) => {
  const submission = await submissionService.getSubmissionById(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(res, 200, "Submission retrieved successfully", submission);
});

export const reviewSubmission = catchAsync(async (req, res) => {
  const submission = await submissionService.reviewSubmission(
    req.params.id,
    req.user.id,
    req.body,
  );

  return sendSuccess(res, 200, "Submission reviewed successfully", submission);
});
