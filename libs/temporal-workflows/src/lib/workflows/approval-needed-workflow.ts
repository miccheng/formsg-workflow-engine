import * as wf from '@temporalio/workflow';
import type * as emailActivities from '../activities/email-activity';

const { emailActivity } = wf.proxyActivities<typeof emailActivities>({
  startToCloseTimeout: '1 minute',
});

type ResponseInput = {
  approved: boolean;
  reason?: string;
};

export const respondSignal = wf.defineSignal<[ResponseInput]>('respond');
export const statusQuery = wf.defineQuery<string>('status');

export async function approvalNeededWorkflow(
  approvalId: string,
  recipientEmail: string
): Promise<string> {
  let status = 'Pending';
  let reason = '';

  wf.log.info(`Requesting approval from ${recipientEmail}`);
  const emailResult = await emailActivity({
    email: recipientEmail,
    subject: `Your response is needed for the following request: ${approvalId}`,
    message: `To approval: http://localhost:3000/api/approval-request/${approvalId}/approve \nTo reject: http://localhost:3000/api/approval-request/${approvalId}/reject`,
    messageHTML: `To approval: <a href="http://localhost:3000/api/approval-request/${approvalId}/approve">Approve</a> <br> To reject: <a href="http://localhost:3000/api/approval-request/${approvalId}/reject">Reject</a>`,
  });
  wf.log.info(`Email sent to ${recipientEmail}`, { emailResult });

  wf.setHandler(respondSignal, (input) => {
    wf.log.info('Received response', { input });
    status = input.approved ? 'Approved' : 'Rejected';
    if (input.reason) reason = input.reason;
  });
  wf.setHandler(statusQuery, () => status);

  wf.log.info('Stopped waiting for response');

  try {
    await wf.condition(() => status !== 'Pending');

    wf.log.info('Unblocked');
    if (status === 'Approved') {
      wf.log.info('Approved');
      return 'Approved with reason: ' + reason;
    } else {
      wf.log.info('Rejected', { reason });
      return 'Rejected with reason: ' + reason;
    }
  } catch (err) {
    if (err instanceof wf.CancelledFailure) {
      wf.log.info('Cancelled');
    }
    throw err;
  }
}
