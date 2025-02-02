import { log } from '@temporalio/activity';
import { PrismaClient, type Submissions } from '@prisma/client';
import { DateTime } from 'luxon';
const prisma = new PrismaClient();

export const persistSubmissionActivity = async (
  formId: string,
  submissionId: string,
  formData: any,
  createdAt?: string
): Promise<Submissions> => {
  const originalSubmission = await prisma.submissions.findFirst({
    where: { formId, submissionId },
  });

  if (originalSubmission) return originalSubmission;

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

  const newSubmission = await prisma.submissions.create({
    data: data,
  });

  log.info(
    `Persisted Submission: FormID: ${formId}, SubmissionID: ${submissionId}, DB ID: ${newSubmission.id}`
  );

  return newSubmission;
};
