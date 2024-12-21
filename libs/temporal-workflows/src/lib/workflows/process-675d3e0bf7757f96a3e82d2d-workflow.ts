import { proxyActivities, log } from '@temporalio/workflow';

import type * as validateEmailActivities from '../activities/validate-email-activity';
import type * as retrieveSubmissionActivities from '../activities/retrieve-submission-activity';

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

// {
//   "responses": [
//     {
//       "_id": "675d3e28f6cd69f42f2427de",
//       "answer": "Michael Cheng",
//       "question": "Full Name",
//       "fieldType": "textfield"
//     },
//     {
//       "_id": "675d3e1edb2dac8ff73bd088",
//       "answer": "mcheng.work@gmail.com",
//       "question": "Email",
//       "fieldType": "email"
//     },
//     {
//       "_id": "675d3e72ce3d08e836a40af4",
//       "answer": "+6591855166",
//       "question": "Mobile number",
//       "fieldType": "mobile"
//     },
//     {
//       "_id": "675d3e5e594e1567c22bbae2",
//       "answer": "01 Jan 1990",
//       "question": "Date of Birth",
//       "fieldType": "date"
//     },
//     {
//       "_id": "675e72d95af0fced0020cc9d",
//       "answer": "Oops",
//       "question": "Tell me a story",
//       "fieldType": "textarea"
//     },
//     {
//       "_id": "675d3e87f7757f96a3e83385",
//       "answer": "ABC1234",
//       "question": "Verification Code",
//       "fieldType": "textfield"
//     },
//     {
//       "_id": "675d3e446f95149817d643a3",
//       "answer": "Very",
//       "question": "How smart are you",
//       "fieldType": "radiobutton"
//     },
//     {
//       "_id": "675e72ef62bc2593507981b3",
//       "answer": "3",
//       "question": "How cool is Satish?",
//       "fieldType": "rating"
//     }
//   ]
// }

type FormResponseDTO = {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  story: string;
  verificationCode: string;
  smartness: string;
  coolness: number;
};

const parseSubmissionModel = (responses: any[]): FormResponseDTO => {
  const newDTO: FormResponseDTO = {
    fullName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    story: '',
    verificationCode: '',
    smartness: '',
    coolness: 0,
  };

  responses.forEach((field) => {
    if (field.question === 'Full Name' && field.fieldType === 'textfield') {
      newDTO.fullName = field.answer;
    } else if (field.question === 'Email' && field.fieldType === 'email') {
      newDTO.email = field.answer;
    } else if (
      field.question === 'Mobile number' &&
      field.fieldType === 'mobile'
    ) {
      newDTO.mobileNumber = field.answer;
    } else if (
      field.question === 'Date of Birth' &&
      field.fieldType === 'date'
    ) {
      newDTO.dateOfBirth = field.answer;
    } else if (
      field.question === 'Tell me a story' &&
      field.fieldType === 'textarea'
    ) {
      newDTO.story = field.answer;
    } else if (
      field.question === 'Verification Code' &&
      field.fieldType === 'textfield'
    ) {
      newDTO.verificationCode = field.answer;
    } else if (
      field.question === 'How smart are you' &&
      field.fieldType === 'radiobutton'
    ) {
      newDTO.smartness = field.answer;
    } else if (
      field.question === 'How cool is Satish?' &&
      field.fieldType === 'rating'
    ) {
      newDTO.coolness = parseInt(field.answer);
    }
  });

  return newDTO;
};

export const process675d3e0bf7757f96a3e82d2dWorkflow = async (
  submissionId: string
): Promise<string> => {
  log.info('Processing submission', { submissionId });

  const submissionData = await retrieveSubmissionActivity(submissionId);

  const formDTO = parseSubmissionModel(submissionData['responses']);

  const result = await validateEmailActivity(formDTO.email);

  if (result) {
    return 'Email is valid';
  } else {
    return 'Email is not valid';
  }
};
