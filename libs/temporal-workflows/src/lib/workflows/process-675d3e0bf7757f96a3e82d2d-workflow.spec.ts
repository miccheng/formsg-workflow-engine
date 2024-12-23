import { process675d3e0bf7757f96a3e82d2dWorkflow } from './process-675d3e0bf7757f96a3e82d2d-workflow';
import { Worker } from '@temporalio/worker';
import { TestWorkflowEnvironment } from '@temporalio/testing';

let testEnv: TestWorkflowEnvironment;

jest.mock('../helpers/http-request-helper', () => {
  return {
    postRequest: async (url: string, data: any): Promise<any> => {
      return { status: 'OK' };
    },
  };
});

const mockResponse = {
  responses: [
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
      answer: 'ABCD1234',
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
  ],
};

import * as originalActivities from '../all-activities';
import type * as activities from '../all-activities';
const mockActivities: Partial<typeof activities> = {
  ...originalActivities,
  retrieveSubmissionActivity: async () => mockResponse,
  emailActivity: async () => true,
};

describe('process675d3e0bf7757f96a3e82d2dWorkflow', () => {
  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it('should work', async () => {
    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: 'test',
      workflowsPath: require.resolve('../all-workflows'),
      activities: mockActivities,
    });

    const result = await worker.runUntil(
      testEnv.client.workflow.execute(process675d3e0bf7757f96a3e82d2dWorkflow, {
        workflowId: 'test1',
        taskQueue: 'test',
        args: ['submissionId'],
      })
    );

    expect(result).toEqual('Email is sent');
  });
});
