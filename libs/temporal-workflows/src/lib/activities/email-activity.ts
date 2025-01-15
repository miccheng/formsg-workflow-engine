import * as nodemailer from 'nodemailer';
import { log } from '@temporalio/activity';

type EmailActivityInput = {
  email: string;
  subject: string;
  message: string;
  messageHTML?: string;
  attachments?: { filename: string; content: string }[];
};

export const emailActivity = async (
  emailDeliveryOptions: EmailActivityInput
): Promise<string> => {
  const transport = nodemailer.createTransport({
    host: `${process.env.SMTP_HOST}`,
    port: process.env.SMTP_PORT,
  } as nodemailer.TransportOptions);

  const emailOptions: nodemailer.SendMailOptions = {
    from: '"FormSG Workflow Engine" <me@example.email>',
    to: emailDeliveryOptions.email,
    subject: emailDeliveryOptions.subject,
    text: emailDeliveryOptions.message,
  };

  if (emailDeliveryOptions.messageHTML) {
    emailOptions.html = emailDeliveryOptions.messageHTML;
  }

  if (emailDeliveryOptions.attachments) {
    log.info('Adding attachments', {
      attachments: emailDeliveryOptions.attachments,
    });
    emailOptions.attachments = emailDeliveryOptions.attachments;
  }

  const info = await transport.sendMail(emailOptions);

  log.info('Email sent', { messageId: info.messageId });

  return 'Email sent';
};
