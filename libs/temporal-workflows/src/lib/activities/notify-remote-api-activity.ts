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

  try {
    const response = await postRequest(`${remoteApi}/appeals`, options);

    return response.status === 'OK' ? 'OK' : 'NOT_OK';
  } catch (error) {
    if (error.response.status === 400) {
      return error.response.data?.status;
    }
    throw error;
  }
};
