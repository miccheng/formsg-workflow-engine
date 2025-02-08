import { proxyActivities, log } from '@temporalio/workflow';

import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';
import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as emailActivities from '../activities/email-activity';
import type * as ocrActivities from '../activities/document-ocr-activity';
import type * as metadataMatchingActivities from '../activities/metadata-matching-activity';

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

const { metadataMatchingActivity } = proxyActivities<
  typeof metadataMatchingActivities
>({
  startToCloseTimeout: '1 minute',
});

const definition: FormDefinition = {
  emailField: 'Email',
  submitterField: 'Name',
  fields: {
    'Document Type': 'documentType',
    Document: 'document',
    'ID Number': 'idNumber',
    'Travel Document Number': 'tdNumber',
    'Company Name': 'companyName',
    'Issuing Organisation': 'issuingOrganisation',
  },
};

export const process67a708c9dcc3e09f3a3393f5Workflow = async (
  submissionId: string
): Promise<string> => {
  log.info('Processing submission', { submissionId });

  const submissionData = await retrieveSubmissionActivity(submissionId);

  const formDTO = parseSubmissionModel(definition, submissionData);
  log.info('Parsed submission data', { formDTO });

  const emailValidationResult = await validateEmailActivity(formDTO.email);

  const ocrResult = await documentOcrActivity(
    formDTO.fields.document.answer
  )[0];

  const searchFields = {
    name: formDTO.submitter,
  };
  switch (formDTO.fields.documentType.answer) {
    case 'Travel Document':
      searchFields['tdNumber'] = formDTO.fields.tdNumber.answer;
      break;
    case 'ID Card':
      searchFields['idNumber'] = formDTO.fields.idNumber.answer;
      break;
    case 'Certificate':
      searchFields['issuingOrganisation'] =
        formDTO.fields.issuingOrganisation.answer;
      break;
    case 'Contract':
      searchFields['companyName'] = formDTO.fields.companyName.answer;
      break;
    default:
      break;
  }
  const metadataMatchingResult = await metadataMatchingActivity(
    ocrResult.text,
    searchFields
  );
  log.info('metadataMatchingResult', metadataMatchingResult);

  if (emailValidationResult) {
    const fileName = formDTO.fields.document.answer.split('/').pop();
    const preprocessedFileName = ocrResult.preprocessedFilePath
      .split('/')
      .pop();
    const htmlDoc = `<html><head><title>HOCR</title></head><body>${ocrResult.hocr.replace(
      /unknown/g,
      preprocessedFileName
    )}<script src="https://unpkg.com/hocrjs"></script></body></html>`;

    await emailActivity({
      email: formDTO.email,
      subject: 'Thank you for your submission',
      message: `Hi ${formDTO.submitter}, Thank you for your submission`,
      attachments: [
        { filename: 'text.txt', content: ocrResult?.text },
        { filename: 'hocr.html', content: htmlDoc },
        {
          filename: 'metadata_matching.json',
          content: JSON.stringify(metadataMatchingResult),
        },
        { filename: fileName, path: formDTO.fields.document.answer },
        {
          filename: preprocessedFileName,
          path: ocrResult.preprocessedFilePath,
        },
      ],
    });
  } else {
    log.error('Email is not valid', { emailValidationResult });
    return 'Email is not valid';
  }

  return 'OK';
};
