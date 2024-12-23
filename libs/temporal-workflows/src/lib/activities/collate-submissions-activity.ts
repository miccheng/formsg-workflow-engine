import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const collateSubmissionsActivity = async (
  formId: string,
  date: string
): Promise<any> => {
  const submissions = await prisma.submissions.findMany({
    where: { formId, createdAt: { gte: new Date(date) } },
  });

  return submissions;
};
