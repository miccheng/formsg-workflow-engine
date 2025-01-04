import { log } from '@temporalio/activity';
import { postRequest } from '../helpers/http-request-helper';

type TelegramActivityInput = {
  message: string;
};

export const sendTelegramActivity = async (
  options: TelegramActivityInput
): Promise<string> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ALERT_CHANNEL;

  const response = await postRequest(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      chat_id: chatId,
      text: options.message,
    }
  );

  log.info('Telegram message sent:', { response });
  if (response.ok) {
    return 'Telegram message sent';
  } else {
    return 'Unable to send';
  }
};
