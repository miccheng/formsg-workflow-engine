import { log } from '@temporalio/activity';
import { postRequest } from '../helpers/http-request-helper';

type RemoteApiInput = {
  formId: string;
  submissionId: string;
  activationCode: string;
};

export const notifyRemoteApiActivity = async (
  options: RemoteApiInput
): Promise<string> => {
  const remoteApi = process.env.REMOTE_DATA_API;

  const response = await postRequest(`${remoteApi}/appeals`, options);

  log.info('Remote API message sent:', { response });
  if (response.ok) {
    return 'Remote API sent';
  } else {
    return 'Unable to send';
  }
};
