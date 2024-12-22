import * as nodemailer from 'nodemailer';
import { log } from '@temporalio/activity';

export const thankyouEmailActivity = async (
  email: string,
  message: string
): Promise<boolean> => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const transport = nodemailer.createTransport({
    port: 1025,
  });

  const info = await transport.sendMail({
    from: '"FormSG Workflow Engine" <me@example.email>',
    to: email,
    subject: 'Thank you for your submission',
    text: message,
  });

  log.info('Email sent', { messageId: info.messageId });

  return true;
};
