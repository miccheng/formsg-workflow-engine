import { proxyActivities, log } from '@temporalio/workflow';

import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';
import type * as thankyouEmailActivities from '../activities/thankyou-email-activity';

import {
  type FormDefinition,
  parseSubmissionModel,
} from '../helpers/form-parser';

const { validateEmailActivity } = proxyActivities<
  typeof validateEmailActivities
>({
  startToCloseTimeout: '1 minute',
});

const { retrieveSubmissionActivity } = proxyActivities<
  typeof retrieveSubmissionActivities
>({
  startToCloseTimeout: '1 minute',
});

const { thankyouEmailActivity } = proxyActivities<
  typeof thankyouEmailActivities
>({
  startToCloseTimeout: '1 minute',
});

const definition: FormDefinition = {
  emailField: 'Email',
  submitterField: 'Full Name',
  fields: {
    'Mobile number': 'mobileNumber',
    'Date of Birth': 'dateOfBirth',
    'Tell me a story': 'story',
    'Verification Code': 'verificationCode',
    'How smart are you': 'smartness',
    'How cool is Satish?': 'coolness',
  },
};

export const process675d3e0bf7757f96a3e82d2dWorkflow = async (
  submissionId: string
): Promise<string> => {
  log.info('Processing submission', { submissionId });

  const submissionData = await retrieveSubmissionActivity(submissionId);

  const formDTO = parseSubmissionModel(definition, submissionData['responses']);
  log.info('Parsed submission data', { formDTO });

  const result = await validateEmailActivity(formDTO.email);

  if (result) {
    const emailResult = await thankyouEmailActivity(
      formDTO.email,
      `Hi ${formDTO.submitter}, Thank you for your submission`
    );
    log.info('Email sent', { emailResult });

    return 'Email is sent';
  } else {
    return 'Email is not valid';
  }
};
