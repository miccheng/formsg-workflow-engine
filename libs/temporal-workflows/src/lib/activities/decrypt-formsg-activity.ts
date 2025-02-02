import { log } from '@temporalio/activity';
import {
  PrismaClient,
  SubmissionStatus,
  type Submissions,
} from '@prisma/client';
const prisma = new PrismaClient();

import { SubmissionService } from '../services/submission-service';

export const decryptFormsgActivity = async (
  formId: string,
  submissionId: string
): Promise<Submissions> => {
  log.info('Decrypting FormSG submission', { formId, submissionId });

  try {
    const theForm = await prisma.sGForms.findUniqueOrThrow({
      select: { formSecret: true },
      where: { formId },
    });

    const submission = await prisma.submissions.findFirstOrThrow({
      where: { formId, submissionId },
    });

    const service = new SubmissionService(log);
    const response = await service.decryptFormData({
      signature: submission.encryptedContent['requestDetails'].signature,
      postURI: submission.encryptedContent['requestDetails'].postURI,
      formSecretKey: theForm.formSecret,
      formData: submission.encryptedContent['requestBody'],
    });

    const updatedSubmission = await prisma.submissions.update({
      where: { id: submission.id },
      data: {
        formData: response.formData,
        status: SubmissionStatus.DECRYPTED,
      },
    });

    return updatedSubmission;
  } catch (error) {
    log.error('Error decrypting FormSG submission', {
      formId,
      submissionId,
      error,
    });
    throw error;
  }
};
