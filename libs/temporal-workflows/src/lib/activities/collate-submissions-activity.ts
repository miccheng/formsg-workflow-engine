import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { stringify } from 'csv-stringify/sync';
import { FormField } from '@opengovsg/formsg-sdk/dist/types';
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
    const formData = submission.formData as FormField[];

    return Object.fromEntries(
      formData.map((response) => [response.question, response.answer])
    );
  });

  const csvString = stringify(records, { header: true });

  return csvString;
};
