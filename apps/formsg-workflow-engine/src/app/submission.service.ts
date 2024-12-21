import { Injectable, Logger } from '@nestjs/common';
import formsg from '@opengovsg/formsg-sdk';
import {
  DecryptedContent,
  DecryptParams,
  DecryptParamsV3,
} from '@opengovsg/formsg-sdk/dist/types';

@Injectable()
export class SubmissionService {
  decryptFormData(
    signature: string,
    postURI: string,
    formSecretKey: string,
    formData: DecryptParams | DecryptParamsV3
  ): { message: string; formData?: DecryptedContent } {
    const FormSG = formsg();

    FormSG.webhooks.authenticate(signature, postURI);
    const submission: DecryptedContent = FormSG.crypto.decrypt(
      formSecretKey,
      formData
    );
    Logger.debug('Decrypted data', submission);
    return {
      message: 'Successfully decrypted form data',
      formData: submission,
    };
  }
}
