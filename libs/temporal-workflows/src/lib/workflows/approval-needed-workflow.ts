import * as wf from '@temporalio/workflow';

type ResponseInput = {
  approved: boolean;
  reason?: string;
};

export const respondSignal = wf.defineSignal<[ResponseInput]>('respond');
export const statusQuery = wf.defineQuery<string>('status');

export async function approvalNeededWorkflow(
  recipientEmail: string
): Promise<string> {
  let status = 'Pending';
  let reason = '';

  wf.log.info(`Requesting approval from ${recipientEmail}`);

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
