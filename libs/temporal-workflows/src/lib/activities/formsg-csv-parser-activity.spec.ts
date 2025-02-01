import { formsgCsvParserActivity } from './formsg-csv-parser-activity';
import { MockActivityEnvironment } from '@temporalio/testing';

const mockData = `Expected total responses,54
Success count,54
Error count,0
Unverified response count,0
See download status column for download errors
Response ID,Timestamp,Download Status,Full Name,Email,Mobile number,Date of Birth,Tell me a story,Verification Code,How smart are you,How cool is Satish?
675d3f0bf7757f96a3e83a45,14 Dec 2024 04:17:15 PM,Success,Michael Cheng,michael@example.com,+65987654321,25 Dec 2024,,1234,Very,5
675e80152ee4ed9764ab5703,15 Dec 2024 03:07:01 PM,Success,Satish Appanasamy,satish@example.com,+658763388,25 Mar 1988,Robinhood is soo cool!,112,Very,5`;

describe('formsgCsvParserActivity', () => {
  let mockTemporalEnv: MockActivityEnvironment;

  beforeEach(() => {
    mockTemporalEnv = new MockActivityEnvironment({ attempt: 2 });
  });

  it('should parse CSV', async () => {
    expect(
      await mockTemporalEnv.run(formsgCsvParserActivity, mockData)
    ).toEqual([
      {
        submissionId: '675d3f0bf7757f96a3e83a45',
        createdAt: '14 Dec 2024 04:17:15 PM',
        formData: {
          responses: [
            { question: 'Full Name', answer: 'Michael Cheng' },
            { question: 'Email', answer: 'michael@example.com' },
            { question: 'Mobile number', answer: '+65987654321' },
            { question: 'Date of Birth', answer: '25 Dec 2024' },
            { question: 'Tell me a story', answer: '' },
            { question: 'Verification Code', answer: '1234' },
            { question: 'How smart are you', answer: 'Very' },
            { question: 'How cool is Satish?', answer: '5' },
          ],
        },
      },
      {
        submissionId: '675e80152ee4ed9764ab5703',
        createdAt: '15 Dec 2024 03:07:01 PM',
        formData: {
          responses: [
            { question: 'Full Name', answer: 'Satish Appanasamy' },
            { question: 'Email', answer: 'satish@example.com' },
            { question: 'Mobile number', answer: '+658763388' },
            { question: 'Date of Birth', answer: '25 Mar 1988' },
            { question: 'Tell me a story', answer: 'Robinhood is soo cool!' },
            { question: 'Verification Code', answer: '112' },
            { question: 'How smart are you', answer: 'Very' },
            { question: 'How cool is Satish?', answer: '5' },
          ],
        },
      },
    ]);
  });
});
