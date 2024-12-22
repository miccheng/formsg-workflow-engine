import * as nodemailer from 'nodemailer';
import { log } from '@temporalio/activity';

export const thankyouEmailActivity = async (
  email: string,
  message: string
): Promise<boolean> => {
  const transport = nodemailer.createTransport({
    host: `${process.env.SMTP_HOST}`,
    port: process.env.SMTP_PORT,
  } as nodemailer.TransportOptions);

  const info = await transport.sendMail({
    from: '"FormSG Workflow Engine" <me@example.email>',
    to: email,
    subject: 'Thank you for your submission',
    text: message,
  });

  log.info('Email sent', { messageId: info.messageId });

  return true;
};
