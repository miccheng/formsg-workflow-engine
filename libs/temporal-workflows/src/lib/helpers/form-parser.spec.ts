import { type FormDefinition, parseSubmissionModel } from './form-parser';

describe('parseSubmissionModel', () => {
  it('should parse definition', async () => {
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

    const responses = [
      {
        _id: '675d3e28f6cd69f42f2427de',
        answer: 'Michael Cheng',
        question: 'Full Name',
        fieldType: 'textfield',
      },
      {
        _id: '675d3e1edb2dac8ff73bd088',
        answer: 'me@example.com',
        question: 'Email',
        fieldType: 'email',
      },
      {
        _id: '675d3e72ce3d08e836a40af4',
        answer: '+6581234567',
        question: 'Mobile number',
        fieldType: 'mobile',
      },
      {
        _id: '675d3e5e594e1567c22bbae2',
        answer: '01 Jan 1990',
        question: 'Date of Birth',
        fieldType: 'date',
      },
      {
        _id: '675e72d95af0fced0020cc9d',
        answer: 'Oops',
        question: 'Tell me a story',
        fieldType: 'textarea',
      },
      {
        _id: '675d3e87f7757f96a3e83385',
        answer: 'ABC1234',
        question: 'Verification Code',
        fieldType: 'textfield',
      },
      {
        _id: '675d3e446f95149817d643a3',
        answer: 'Very',
        question: 'How smart are you',
        fieldType: 'radiobutton',
      },
      {
        _id: '675e72ef62bc2593507981b3',
        answer: '3',
        question: 'How cool is Satish?',
        fieldType: 'rating',
      },
    ];

    const result = parseSubmissionModel(definition, responses);

    expect(result.email).toEqual('me@example.com');
    expect(result.submitter).toEqual('Michael Cheng');
    expect(result.fields).toEqual({
      mobileNumber: {
        question: 'Mobile number',
        fieldType: 'mobile',
        answer: '+6581234567',
      },
      dateOfBirth: {
        question: 'Date of Birth',
        fieldType: 'date',
        answer: '01 Jan 1990',
      },
      story: {
        question: 'Tell me a story',
        fieldType: 'textarea',
        answer: 'Oops',
      },
      verificationCode: {
        question: 'Verification Code',
        fieldType: 'textfield',
        answer: 'ABC1234',
      },
      smartness: {
        question: 'How smart are you',
        fieldType: 'radiobutton',
        answer: 'Very',
      },
      coolness: {
        question: 'How cool is Satish?',
        fieldType: 'rating',
        answer: '3',
      },
    });
  });
});
