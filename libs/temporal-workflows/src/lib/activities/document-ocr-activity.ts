import { log } from '@temporalio/activity';
import Tesseract, { createWorker } from 'tesseract.js';
import sharp from 'sharp';
// import { fromPath } from 'pdf2pic';

export type OcrResult = {
  text: string;
  hocr: string;
  originalFilePath: string;
  preprocessedFilePath: string;
};

export const documentOcrActivity = async (
  imagePath: string
): Promise<OcrResult[]> => {
  log.debug('Processing image', { imagePath });

  if (imagePath.endsWith('.pdf')) {
    throw new Error('PDF files are not supported');
  }

  const result = await doOcr(imagePath);

  return [result];
};

const doOcr = async (imagePath: string): Promise<OcrResult> => {
  const preprocessedImg = preprocessImage(imagePath);

  const imageBuffer = await preprocessedImg.toBuffer();
  const { text, hocr } = await runRecognize(imageBuffer);

  const preprocessedFilePath = fileNameWithPrefix(imagePath, 'preprocessed');
  await preprocessedImg.toFile(preprocessedFilePath);

  return {
    text,
    hocr,
    originalFilePath: imagePath,
    preprocessedFilePath,
  };
};

// const splitPdf = async (pdfPath: string): Promise<string[]> => {
//   const options = {
//     density: 100,
//     saveFilename: "split",
//     savePath: pdfPath.split('/').slice(0, -1).join('/'),
//     format: "png",
//     width: 600,
//     height: 600
//   };
//   const convert = fromPath(pdfPath, options);
//   const pageToConvertAsImage = 1;

//   convert(pageToConvertAsImage, { responseType: "image" })
// }

const preprocessImage = (imagePath: string): sharp.Sharp => {
  const img = sharp(imagePath);
  const preprocessedImg = img
    .resize(2000, 2000, {
      fit: 'inside',
      position: 'center',
    })
    .threshold(100, { greyscale: true });

  return preprocessedImg;
};

const runRecognize = async (
  image: Buffer,
  worker?: Tesseract.Worker
): Promise<{ text: string; hocr: string }> => {
  let hasSharedWorker = false;
  if (!worker) {
    hasSharedWorker = true;
    worker = await createWorker('eng', 1, {
      logger: (m) => log.debug('Logging Tesseract:', m),
    });
  }

  const {
    data: { text, hocr },
  } = await worker.recognize(image, {}, { text: true, hocr: true });

  log.debug(text);
  log.debug(hocr);

  if (!hasSharedWorker) await worker.terminate();

  return { text, hocr };
};

const fileNameWithPrefix = (filePath: string, prefix: string): string => {
  const fileName = filePath.split('/').pop();
  const preprocessedFileName = `${prefix}-${fileName}`;
  const folderPath = filePath.split('/').slice(0, -1).join('/');
  return `${folderPath}/${preprocessedFileName}`;
};
