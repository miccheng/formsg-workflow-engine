import { Injectable } from '@nestjs/common';
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
    formData: DecryptParams | DecryptParamsV3
  ): { message: string; formData?: DecryptedContent } {
    const formSecretKey = process.env.FORM_SECRET_KEY;
    const FormSG = formsg();

    try {
      FormSG.webhooks.authenticate(signature, postURI);
      const submission: DecryptedContent = FormSG.crypto.decrypt(
        formSecretKey,
        formData
      );
      // console.log('decrypted data', submission);
      return {
        message: 'Successfully decrypted form data',
        formData: submission,
      };
    } catch (e) {
      console.error(e);
      return { message: 'Error authenticating webhook' };
    }
  }
}
