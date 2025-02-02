import * as formsg from '@opengovsg/formsg-sdk';
import {
  FormField,
  DecryptedFile,
  DecryptParams,
} from '@opengovsg/formsg-sdk/dist/types';
import * as fs from 'fs';
import * as path from 'path';

export type EncryptedContent = {
  requestBody: DecryptParams & {
    formId: string;
    submissionId: string;
    created: string;
  };
  requestDetails: {
    signature: string;
    postURI: string;
  };
};

export type DecryptionParam = {
  signature: string;
  postURI: string;
  formSecretKey: string;
  formData: DecryptParams & {
    formId: string;
    submissionId: string;
    created: string;
  };
};

export class SubmissionService {
  async decryptFormData(params: DecryptionParam): Promise<{
    message: string;
    formData: FormField[];
    attachments?: Record<string, DecryptedFile>;
  }> {
    const { signature, postURI, formSecretKey, formData } = params;

    const hasAttachments =
      Object.keys(formData.attachmentDownloadUrls).length > 0;
    const FormSG = formsg();

    FormSG.webhooks.authenticate(signature, postURI);

    if (hasAttachments) {
      const submission = await FormSG.crypto.decryptWithAttachments(
        formSecretKey,
        formData
      );
      // Logger.debug('Decrypted data', submission);

      Object.entries(submission.attachments).forEach(
        ([attachmentName, attachment]) => {
          // Logger.debug('Decrypted attachment', attachment);

          const attachmentDir = path.join(
            process.env.ATTACHMENT_PATH,
            formData.formId,
            formData.submissionId,
            attachmentName
          );
          // Logger.debug(`Creating attachment directory ${attachmentDir}`);
          fs.mkdirSync(attachmentDir, { recursive: true });
          // Logger.debug(status);

          const destFilePath = path.join(attachmentDir, attachment.filename);
          fs.writeFileSync(destFilePath, attachment.content);

          const fileFieldIndex = submission.content.responses.findIndex(
            (field) => field._id === attachmentName
          );
          submission.content.responses[fileFieldIndex].answer =
            destFilePath.toString();
        }
      );

      return {
        message: 'Successfully decrypted form data',
        formData: submission.content.responses,
      };
    } else {
      const submission = FormSG.crypto.decrypt(formSecretKey, formData);
      // Logger.debug('Decrypted data', submission);
      return {
        message: 'Successfully decrypted form data',
        formData: submission.responses,
      };
    }
  }
}
