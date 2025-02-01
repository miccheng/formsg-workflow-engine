import { log } from '@temporalio/activity';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const persistSubmissionActivity = async (
  formId: string,
  submissionId: string,
  formData: any
): Promise<string> => {
  const originalSubmission = await prisma.submissions.findFirst({
    where: { formId, submissionId },
  });

  if (originalSubmission) return 'EXISTING_SUBMISSION';

  const submission = await prisma.submissions.create({
    data: {
      formId,
      submissionId,
      formData,
    },
  });

  log.info(
    `Persisted Submission: FormID: ${formId}, SubmissionID: ${submissionId}, DB ID: ${submission.id}`
  );

  return 'PERSISTED_SUBMISSION';
};
