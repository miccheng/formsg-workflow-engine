import { proxyActivities, log } from '@temporalio/workflow';
import * as pathHelpers from '../helpers/path-helpers';

import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';
import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as emailActivities from '../activities/email-activity';
import type * as ocrActivities from '../activities/document-ocr-activity';
import type * as metadataMatchingActivities from '../activities/metadata-matching-activity';
import type * as buildZipFileActivities from '../activities/build-zip-file-activity';

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

const { buildZipFileActivity } = proxyActivities<typeof buildZipFileActivities>(
  {
    startToCloseTimeout: '1 minute',
  }
);

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

export const processDocumentVerificationPocWorkflow = async (
  submissionId: string
): Promise<string> => {
  log.info('Processing submission', { submissionId });

  const submissionData = await retrieveSubmissionActivity(submissionId);

  const formDTO = parseSubmissionModel(definition, submissionData);
  log.info('Parsed submission data', { formDTO });

  const emailValidationResult = await validateEmailActivity(formDTO.email);

  const ocrResult = await documentOcrActivity(formDTO.fields.document.answer);

  if (ocrResult.length > 0) {
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

    const fullMetadata = ocrResult.reduce((acc, curr) => {
      acc.push(curr.text);
      return acc;
    }, []);

    const metadataMatchingResult = await metadataMatchingActivity(
      fullMetadata.join('\n'),
      searchFields
    );
    log.info('metadataMatchingResult', metadataMatchingResult);

    if (emailValidationResult) {
      const attachments: {
        filename: string;
        content?: string;
        path?: string;
      }[] = [
        {
          filename: pathHelpers.basename(formDTO.fields.document.answer),
          path: formDTO.fields.document.answer,
        },
        {
          filename: 'metadata_matching.json',
          content: JSON.stringify(metadataMatchingResult),
        },
      ];
      for (const resultItem of ocrResult) {
        const { text, hocr, preprocessedFilePath } = resultItem;

        const preprocessedFileName = pathHelpers.basename(preprocessedFilePath);
        const preprocessedFileNameWithoutExt = pathHelpers.basename(
          preprocessedFilePath,
          pathHelpers.extname(preprocessedFilePath)
        );

        attachments.push({
          filename: preprocessedFileName,
          path: preprocessedFilePath,
        });

        attachments.push({
          filename: `text-${preprocessedFileNameWithoutExt}.txt`,
          content: text,
        });

        const htmlDoc = `<html><head><title>HOCR</title></head><body>${hocr.replace(
          /unknown/g,
          pathHelpers.basename(preprocessedFilePath)
        )}<script src="https://unpkg.com/hocrjs"></script></body></html>`;
        attachments.push({
          filename: `hocr-${preprocessedFileNameWithoutExt}.html`,
          content: htmlDoc,
        });
      }

      const workingDirName = pathHelpers.dirname(
        formDTO.fields.document.answer
      );
      const zipFilePath = pathHelpers.join(
        workingDirName,
        `submission-result-${submissionId}.zip`
      );
      const buildZipResult = await buildZipFileActivity(
        zipFilePath,
        attachments
      );
      log.info('Build Zip File Result', { buildZipResult });

      await emailActivity({
        email: formDTO.email,
        subject: 'Thank you for your submission',
        message: `Hi ${formDTO.submitter}, Thank you for your submission.

${printMetadataMatchingResult(metadataMatchingResult)}
`,
        attachments: [
          {
            filename: 'submission-result.zip',
            path: zipFilePath,
          },
        ],
      });

      return 'Email sent';
    } else {
      log.error('Email is not valid', { emailValidationResult });
      return 'Email is not valid';
    }
  } else {
    log.error('No OCR result', { ocrResult });
    return 'No OCR result';
  }
};

const printMetadataMatchingResult = (
  metadataMatchingResult: metadataMatchingActivities.MetaMatchResult
) => {
  log.info('Metadata matching result', metadataMatchingResult);

  const textArray = [];

  textArray.push('Metadata matching result:');
  for (const [key, value] of Object.entries(metadataMatchingResult)) {
    textArray.push(`- ${key}:`);
    for (const item of value) {
      if (item.matches.length === 0) {
        textArray.push(`  - ${item.searchStr}: no matches`);
      } else {
        if (item.matches[0].score === 0) {
          textArray.push(`  - ${item.searchStr}: exact match`);
        } else if (item.matches[0].score > 0.5) {
          textArray.push(`  - ${item.searchStr}: no match`);
        } else {
          const firstScore = Math.round(item.matches[0].score * 100) / 100;
          const scorePercentage = (1 - firstScore) * 100;
          textArray.push(`  - ${item.searchStr}: ${scorePercentage}% match`);
        }
      }
    }
  }

  return textArray.join('\n');
};
