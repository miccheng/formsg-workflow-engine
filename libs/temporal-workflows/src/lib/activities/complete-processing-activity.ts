import { PrismaClient, SubmissionStatus } from '@prisma/client';
const prisma = new PrismaClient();

export const completeProcessingActivity = async (
  formId: string,
  submissionId: string
): Promise<string> => {
  const submission = await prisma.submissions.findFirstOrThrow({
    where: { formId, submissionId },
  });

  await prisma.submissions.update({
    where: { id: submission.id },
    data: {
      status: SubmissionStatus.PROCESSED,
    },
  });

  return 'PROCESSED_SUCCESSFUL';
};
