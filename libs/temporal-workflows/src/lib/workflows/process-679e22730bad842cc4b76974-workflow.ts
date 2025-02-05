import { proxyActivities, log } from '@temporalio/workflow';
import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';
import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as emailActivities from '../activities/email-activity';
import type * as ocrActivities from '../activities/document-ocr-activity';

import {
  type FormDefinition,
  parseSubmissionModel,
} from '../helpers/form-parser';

const { retrieveSubmissionActivity } = proxyActivities<
  typeof retrieveSubmissionActivities
>({
  startToCloseTimeout: '1 minute',
});

const { validateEmailActivity } = proxyActivities<
  typeof validateEmailActivities
>({
  startToCloseTimeout: '1 minute',
});

const { emailActivity } = proxyActivities<typeof emailActivities>({
  startToCloseTimeout: '1 minute',
});

const { documentOcrActivity } = proxyActivities<typeof ocrActivities>({
  startToCloseTimeout: '1 minute',
});

const definition: FormDefinition = {
  emailField: 'Email',
  submitterField: 'Name',
  fields: {
    'Supporting Doc': 'supportingDoc',
    'More Document': 'moreDocument',
  },
};

export const process679e22730bad842cc4b76974workflow = async (
  submissionId: string
): Promise<string> => {
  log.info('Processing submission', { submissionId });

  const submissionData = await retrieveSubmissionActivity(submissionId);

  const formDTO = parseSubmissionModel(definition, submissionData);
  log.info('Parsed submission data', { formDTO });

  const emailValidationResult = await validateEmailActivity(formDTO.email);

  const ocrResult = await documentOcrActivity(
    formDTO.fields.supportingDoc.answer
  );

  if (emailValidationResult) {
    const fileName = formDTO.fields.supportingDoc.answer.split('/').pop();
    const htmlDoc = `<html><head><title>HOCR</title></head><body>${ocrResult.hocr.replace(
      /unknown/g,
      fileName
    )}<script src="https://unpkg.com/hocrjs"></script></body></html>`;

    await emailActivity({
      email: formDTO.email,
      subject: 'Thank you for your submission',
      message: `Hi ${formDTO.submitter}, Thank you for your submission`,
      attachments: [
        { filename: 'text.txt', content: ocrResult?.text },
        { filename: 'hocr.html', content: htmlDoc },
      ],
    });
  } else {
    log.error('Email is not valid', { emailValidationResult });
    return 'Email is not valid';
  }

  return 'OK';
};
