import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
const prisma = new PrismaClient();

export const collateSubmissionsActivity = async (
  formId: string,
  date: string
): Promise<any> => {
  const dt = DateTime.fromISO(date);

  const submissions = await prisma.submissions.findMany({
    where: { formId, createdAt: { gte: dt.toJSDate() } },
  });

  return submissions;
};
