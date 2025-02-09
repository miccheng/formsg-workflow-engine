import * as pathHelpers from './path-helpers';

describe('pathHelpers', () => {
  describe('#basename', () => {
    it('should return the base name of the file path', () => {
      const filePath = '/path/to/file.txt';
      expect(pathHelpers.basename(filePath)).toEqual('file.txt');
    });

    it('should return the base name of the file path minus the suffix', () => {
      const filePath = '/path/to/file.txt';
      expect(pathHelpers.basename(filePath, '.txt')).toEqual('file');
    });
  });

  describe('#dirname', () => {
    it('should return the directory name of the file path', () => {
      const filePath = '/path/to/file.txt';
      expect(pathHelpers.dirname(filePath)).toEqual('/path/to');
    });
  });

  describe('#extname', () => {
    it('should return the extension name of the file path', () => {
      const filePath = '/path/to/file.txt';
      expect(pathHelpers.extname(filePath)).toEqual('.txt');
    });
  });

  describe('#join', () => {
    it('should join the path components', () => {
      expect(pathHelpers.join('/path', 'to', 'file.txt')).toEqual(
        '/path/to/file.txt'
      );
    });
  });
});
