import { proxyActivities, log, executeChild } from '@temporalio/workflow';

import type * as getFileContentActivities from '../activities/get-file-contents-activity';
import type * as formsgCsvParserActivities from '../activities/formsg-csv-parser-activity';

import { processSubmissionWorkflow } from './process-submission-workflow';

const { getFileContentsActivity } = proxyActivities<
  typeof getFileContentActivities
>({
  startToCloseTimeout: '5 minute',
});

const { formsgCsvParserActivity } = proxyActivities<
  typeof formsgCsvParserActivities
>({
  startToCloseTimeout: '5 minute',
});

export const batchProcessFormsgCsvWorkflow = async (
  formId: string,
  fileUrl: string
): Promise<string> => {
  log.info(`Open file ${fileUrl} for form: ${formId}`);

  const fileContent = await getFileContentsActivity(fileUrl);
  if (!fileContent) {
    log.error('File content is empty');
    return 'EMPTY_FILE';
  }

  const submissions = await formsgCsvParserActivity(fileContent);
  if (!submissions || submissions.length === 0) {
    log.info('No submissions found in file');
    return 'NO_SUBMISSIONS';
  }

  const responseArray = await Promise.all(
    submissions.map(async (submission) => {
      const { submissionId, createdAt, formData } = submission;

      return await executeChild(processSubmissionWorkflow, {
        args: [formId, submissionId, formData, createdAt],
        workflowId: `batch-process-${formId}-${submissionId}`,
      });
    })
  );

  return responseArray.join(',');
};
