import { parse } from 'csv-parse/sync';
import { log } from '@temporalio/activity';

export const formsgCsvParserActivity = async (
  csvContent: string
): Promise<any> => {
  const content = parse(csvContent, {
    from_line: 6,
    columns: true,
    skip_empty_lines: true,
  });

  const result = content.map((row) => {
    const {
      'Response ID': submissionId,
      Timestamp: createdAt,
      'Download Status': downloadStatus,
      ...formFields
    } = row;

    if (downloadStatus !== 'Success') {
      log.debug(`${submissionId} has a download error: ${downloadStatus}`);
    }

    const formData = Object.entries(formFields).reduce((acc, [key, value]) => {
      const parsedValue = { question: key, answer: value };
      acc.push(parsedValue);
      return acc;
    }, []);

    return {
      submissionId: submissionId,
      createdAt: createdAt,
      formData: { responses: formData },
    };
  });

  return result;
};
