import * as fs from 'fs';
import { log } from '@temporalio/activity';

export const getFileContentsActivity = async (
  filePath: string
): Promise<any> => {
  log.info(`Reading file contents from ${filePath}`);

  const fileContents = fs.readFileSync(filePath, 'utf-8');

  return fileContents;
};
