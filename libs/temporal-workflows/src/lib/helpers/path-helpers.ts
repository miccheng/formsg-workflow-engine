const basename = (filePath: string, suffix?: string): string => {
  filePath = filePath.replace(/^.*[\\/]/, '');

  if (suffix) {
    const suffixIndex = filePath.lastIndexOf(suffix);
    if (suffixIndex !== -1) {
      filePath = filePath.substring(0, suffixIndex);
    }
  }
  return filePath;
};

const dirname = (filePath: string): string => {
  return filePath.replace(/\\/g, '/').replace(/\/[^/]*$/, '');
};

const extname = (filePath: string): string => {
  const index = filePath.lastIndexOf('.');
  return index === -1 ? '' : filePath.substring(index);
};

const join = (...pathComponents: string[]): string => {
  return pathComponents.join('/');
};

export { basename, dirname, extname, join };
