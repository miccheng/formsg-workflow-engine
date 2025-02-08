import { log } from '@temporalio/activity';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import { fromPath } from 'pdf2pic';
import { WriteImageResponse } from 'pdf2pic/dist/types/convertResponse';

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

  const result: OcrResult[] = [];

  if (imagePath.endsWith('.pdf')) {
    const images = await splitPdf(imagePath);
    log.debug('Split PDF into images', { images });

    for (const image of images) {
      result.push(await doOcr(image.path));
    }
  } else {
    result.push(await doOcr(imagePath));
  }

  return result;
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

const splitPdf = async (pdfPath: string): Promise<WriteImageResponse[]> => {
  const options = {
    saveFilename: 'split',
    savePath: pdfPath.split('/').slice(0, -1).join('/'),
    preserveAspectRatio: true,
    width: 2000,
    height: 2000,
    density: 144,
  };
  const conversionResult = await fromPath(pdfPath, options).bulk(-1, {
    responseType: 'image',
  });

  log.info('pdf2image result:', { conversionResult });

  return conversionResult;
};

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
  image: Buffer
): Promise<{ text: string; hocr: string }> => {
  const worker = await createWorker('eng', 1, {
    logger: (m) => log.debug('Logging Tesseract:', m),
  });

  const {
    data: { text, hocr },
  } = await worker.recognize(image, {}, { text: true, hocr: true });

  log.debug(text);
  log.debug(hocr);

  await worker.terminate();

  return { text, hocr };
};

const fileNameWithPrefix = (filePath: string, prefix: string): string => {
  const fileName = filePath.split('/').pop();
  const preprocessedFileName = `${prefix}-${fileName}`;
  const folderPath = filePath.split('/').slice(0, -1).join('/');
  return `${folderPath}/${preprocessedFileName}`;
};
