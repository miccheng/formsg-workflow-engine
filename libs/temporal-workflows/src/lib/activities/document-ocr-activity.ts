import { log } from '@temporalio/activity';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

export const documentOcrActivity = async (
  imagePath: string
): Promise<{
  status: string;
  text?: string;
  hocr?: string;
  preprocessedFilePath?: string;
}> => {
  const img = sharp(imagePath);
  // const { width, height } = await img.metadata();
  const preprocessedImg = img
    // .resize(Math.floor(width * 2.5), Math.floor(height * 2.5), {
    .resize(2000, 2000, {
      fit: 'inside',
      position: 'center',
    })
    .threshold(100, { greyscale: true });

  const worker = await createWorker('eng', 1, {
    logger: (m) => log.debug('Logging Tesseract:', m),
  });

  const {
    data: { text, hocr },
  } = await worker.recognize(
    await preprocessedImg.toBuffer(),
    {},
    { text: true, hocr: true }
  );

  log.debug(text);
  log.debug(hocr);

  await worker.terminate();

  const fileName = imagePath.split('/').pop();
  const preprocessedFileName = `preprocessed-${fileName}`;
  const filePath = imagePath.split('/').slice(0, -1).join('/');
  const preprocessedFilePath = `${filePath}/${preprocessedFileName}`;
  await preprocessedImg.toFile(preprocessedFilePath);

  return { status: 'OCR_PROCESSING_DONE', text, hocr, preprocessedFilePath };
};
