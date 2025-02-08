import { log } from '@temporalio/activity';
import Fuse from 'fuse.js';

export type MetaMatchScore = {
  item: string;
  refIndex: number;
  score: number;
};

export type MetaMatchResultItem = {
  searchStr: string;
  matches: MetaMatchScore[];
};

export type MetaMatchResult = {
  [key: string]: MetaMatchResultItem[];
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
    result[key] = [];
    if (value instanceof Array) {
      for (const v of value) {
        result[key].push(...runFuzzSearch(v, fuse, true));
      }
    } else {
      result[key].push(...runFuzzSearch(value, fuse));
    }
  });

  log.info('result', result);

  return result;
};

const runFuzzSearch = (
  searchStr: string,
  fuse: Fuse<string>,
  fullWord = false
) => {
  const fullStrMatches = fuse.search(searchStr);
  if (fullStrMatches.length > 0 && fullStrMatches[0].score === 0) {
    return [{ searchStr, matches: fullStrMatches }];
  }

  const result = [{ searchStr, matches: fullStrMatches }];

  if (searchStr.includes(' ') && !fullWord) {
    searchStr
      .split(' ')
      .forEach((s) => result.push({ searchStr: s, matches: fuse.search(s) }));
  }

  return result;
};
