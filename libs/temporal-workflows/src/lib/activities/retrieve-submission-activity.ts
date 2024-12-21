import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const retrieveSubmissionActivity = async (
  submissionId: string
): Promise<any> => {
  const submission = await prisma.submissions.findFirstOrThrow({
    where: { submissionId },
  });

  return submission.formData;
};
