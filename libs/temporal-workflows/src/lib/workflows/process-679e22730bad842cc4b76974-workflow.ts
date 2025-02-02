import { proxyActivities, log } from '@temporalio/workflow';
import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';
import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as emailActivities from '../activities/email-activity';

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

const definition: FormDefinition = {
  emailField: 'Email',
  submitterField: 'Full Name',
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

  if (emailValidationResult) {
    await emailActivity({
      email: formDTO.email,
      subject: 'Thank you for your submission',
      message: `Hi ${formDTO.submitter}, Thank you for your submission`,
    });
  } else {
    log.error('Email is not valid', { emailValidationResult });
    return 'Email is not valid';
  }

  return 'OK';
};
