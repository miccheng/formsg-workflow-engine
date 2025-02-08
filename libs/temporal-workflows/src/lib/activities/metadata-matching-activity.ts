import { log } from '@temporalio/activity';
import Fuse from 'fuse.js';

export type MetaMatchScore = {
  item: string;
  refIndex: number;
  score: number;
};

export type MetaMatchResult = {
  [key: string]: MetaMatchScore | { [key: string]: MetaMatchScore };
};

export const metadataMatchingActivity = async (
  metadata: string | string[],
  search: { [key: string]: string | string[] }
): Promise<MetaMatchResult> => {
  log.info('metadataMatchingActivity');

  if (!(metadata instanceof Array)) {
    log.debug('metadata is not an Array');

    metadata = metadata.split('\n');
  }
  log.debug('metadata', { metadata });

  const fuse = new Fuse(metadata as string[], {
    includeScore: true,
  });

  const result = {};
  Object.entries(search).forEach(([key, value]) => {
    if (value instanceof Array) {
      result[key] = {};
      for (const v of value) {
        result[key][v] = fuse.search(v);
      }
    } else {
      result[key] = fuse.search(value);
    }
  });

  log.info('result', result);

  return result;
};
