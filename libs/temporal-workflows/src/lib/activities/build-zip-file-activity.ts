import * as fs from 'fs';
import { log } from '@temporalio/activity';
import archiver from 'archiver';
import archiverZipEncrypted from 'archiver-zip-encrypted';

archiver.registerFormat('zip-encrypted', archiverZipEncrypted);

export const buildZipFileActivity = async (
  filePath: string,
  contents: { filename: string; content?: string; path?: string }[],
  password = process.env.ATTACHMENT_PASSWORD
): Promise<{ status: string; filePath?: string; password?: string }> => {
  log.info(`Preparing to build Zip file: ${filePath}`);

  const archive = archiver.create('zip-encrypted', {
    zlib: { level: 9 },
    encryptionMethod: 'aes256',
    password: password,
  });

  const output = fs.createWriteStream(filePath);
  archive.pipe(output);

  for (const file of contents) {
    if (file.content) {
      archive.append(file.content, { name: file.filename });
    } else if (file.path) {
      archive.append(fs.createReadStream(file.path), { name: file.filename });
    }
  }

  const result = await new Promise((resolve, reject) => {
    archive.on('error', (err) => {
      log.error(`Error building ZIP file: ${err.message}`);
      output.end();
      reject('Error building ZIP file');
    });

    archive.on('end', () => {
      output.end();

      resolve({ filePath });
    });

    archive.finalize();
  });

  if (result === 'Error building ZIP file') {
    return { status: result };
  }

  log.info(`Zip file created: ${filePath}`, { result });

  return { status: 'ZIP file created successfully', filePath, password };
};
