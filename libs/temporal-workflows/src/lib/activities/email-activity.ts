import * as nodemailer from 'nodemailer';
import { log } from '@temporalio/activity';

export const emailActivity = async (
  email: string,
  subject: string,
  message: string,
  attachments?: { filename: string; content: string }[]
): Promise<boolean> => {
  const transport = nodemailer.createTransport({
    host: `${process.env.SMTP_HOST}`,
    port: process.env.SMTP_PORT,
  } as nodemailer.TransportOptions);

  const emailOptions: nodemailer.SendMailOptions = {
    from: '"FormSG Workflow Engine" <me@example.email>',
    to: email,
    subject: subject,
    text: message,
  };

  if (attachments) {
    log.info('Adding attachments', { attachments });
    emailOptions.attachments = attachments;
  }

  const info = await transport.sendMail(emailOptions);

  log.info('Email sent', { messageId: info.messageId });

  return true;
};
