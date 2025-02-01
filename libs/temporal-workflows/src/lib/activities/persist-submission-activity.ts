import { log } from '@temporalio/activity';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
const prisma = new PrismaClient();

export const persistSubmissionActivity = async (
  formId: string,
  submissionId: string,
  formData: any,
  createdAt?: string
): Promise<string> => {
  const originalSubmission = await prisma.submissions.findFirst({
    where: { formId, submissionId },
  });

  if (originalSubmission) return 'EXISTING_SUBMISSION';

  const data = {
    formId,
    submissionId,
    formData,
  };

  if (createdAt && createdAt !== '') {
    data['createdAt'] = DateTime.fromFormat(
      `${createdAt} +08:00`,
      'dd MMM yyyy hh:mm:ss a ZZ'
    ).toJSDate();
  }

  const submission = await prisma.submissions.create({
    data: data,
  });

  log.info(
    `Persisted Submission: FormID: ${formId}, SubmissionID: ${submissionId}, DB ID: ${submission.id}`
  );

  return 'PERSISTED_SUBMISSION';
};
