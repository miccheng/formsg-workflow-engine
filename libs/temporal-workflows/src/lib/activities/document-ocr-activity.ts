import { log } from '@temporalio/activity';
import { createWorker } from 'tesseract.js';

export const documentOcrActivity = async (
  imagePath: string
): Promise<{ status: string; text?: string; hocr?: string }> => {
  const worker = await createWorker('eng', 1, {
    logger: (m) => log.debug('Logging Tesseract:', m),
  });

  const {
    data: { text, hocr },
  } = await worker.recognize(imagePath, {}, { text: true, hocr: true });

  log.debug(text);
  log.debug(hocr);

  await worker.terminate();

  return { status: 'OCR_PROCESSING_DONE', text, hocr };
};
