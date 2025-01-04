import { proxyActivities, log } from '@temporalio/workflow';

import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';
import type * as emailActivities from '../activities/email-activity';
import type * as validateVerificationCodeActivities from '../activities/validate-verification-code-activity';
import type * as sendTelegramActivities from '../activities/send-telegram-activity';

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

const { emailActivity } = proxyActivities<typeof emailActivities>({
  startToCloseTimeout: '1 minute',
});

const { validateVerificationCodeActivity } = proxyActivities<
  typeof validateVerificationCodeActivities
>({
  startToCloseTimeout: '1 minute',
});

const { sendTelegramActivity } = proxyActivities<typeof sendTelegramActivities>(
  {
    startToCloseTimeout: '1 minute',
  }
);

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

  const emailValidationResult = await validateEmailActivity(formDTO.email);

  if (emailValidationResult) {
    const verificationCodeResult = await validateVerificationCodeActivity(
      formDTO.fields?.verificationCode?.answer
    );

    if (verificationCodeResult === 'OK') {
      log.info('Verification code is valid', { verificationCodeResult });

      const emailResult = await emailActivity({
        email: formDTO.email,
        subject: 'Thank you for your submission',
        message: `Hi ${formDTO.submitter}, Thank you for your submission`,
      });
      log.info('Email sent', { emailResult });

      return 'Email is sent';
    } else {
      log.error('Verification code is not valid', { verificationCodeResult });

      const emailResult = await emailActivity({
        email: formDTO.email,
        subject: 'Verification code is not valid',
        message: `Hi ${formDTO.submitter}, Verification code is not valid. Please try again.`,
      });
      log.info('Email sent for invalid entry', { emailResult });

      await sendTelegramActivity({
        message: `Submission with ID ${submissionId} has invalid verification code`,
      });

      return 'Verification code is not valid';
    }
  } else {
    log.error('Email is not valid', { emailValidationResult });
    return 'Email is not valid';
  }
};
