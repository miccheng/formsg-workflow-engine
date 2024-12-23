import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { stringify } from 'csv-stringify/sync';
const prisma = new PrismaClient();

export const collateSubmissionsActivity = async (
  formId: string,
  date: string
): Promise<any> => {
  const dt = DateTime.fromISO(date);

  const submissions = await prisma.submissions.findMany({
    where: { formId, createdAt: { gte: dt.toJSDate() } },
  });

  const records = submissions.map((submission) => {
    return Object.fromEntries(
      submission.formData['responses'].map((response) => [
        response.question,
        response.answer,
      ])
    );
  });

  const csvString = stringify(records, { header: true });

  return csvString;
};
