import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DataURL } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import {
  convertLocalFilesToRemoteInWhiteboard,
  type FileConverter,
  type ConversionLogger,
} from '../fileStore/convertLocalFilesToRemote';
import type { BinaryFileDataWithOptionalUrl, BinaryFileDataWithUrl, WhiteboardWithFiles } from '../types';

/**
 * Implementation tests for convertLocalFilesToRemoteInWhiteboard (T022)
 *
 * These tests verify the actual implementation against the spec requirements:
 * - Never drops files that have valid retrieval paths (url or dataURL)
 * - Preserves files with dataURL when upload fails
 * - Only drops files that have no retrieval path (no url, no dataURL)
 * - Returns structured info about failures for caller to surface
 */

/**
 * Mock file type for testing edge cases.
 * At runtime, files may be missing dataURL (e.g., corrupted data, incomplete sync).
 * This type allows testing those scenarios even though TypeScript's strict types don't permit them.
 */
type MockFileData = {
  id: string;
  mimeType: string;
  created: number;
  url?: string;
  dataURL?: DataURL;
};

// Test data factories
const createMockFile = (id: string, options: { url?: string; dataURL?: DataURL } = {}): MockFileData => ({
  id,
  mimeType: 'image/png',
  created: Date.now(),
  ...options,
});

const createWhiteboard = (
  files: Record<string, MockFileData>,
  extras: Partial<WhiteboardWithFiles> = {}
): WhiteboardWithFiles => ({
  files: files as Record<string, BinaryFileDataWithOptionalUrl>,
  ...extras,
});

// Helper to create a converted file result with proper typing
const toConvertedFile = (file: MockFileData, url: string): BinaryFileDataWithUrl =>
  ({ ...file, url }) as BinaryFileDataWithUrl;

describe('convertLocalFilesToRemoteInWhiteboard implementation', () => {
  let mockConverter: FileConverter;
  let mockLogger: ConversionLogger;

  beforeEach(() => {
    mockConverter = vi.fn();
    mockLogger = {
      onFilePreservedWithDataUrl: vi.fn(),
      onFileUnrecoverable: vi.fn(),
      onConversionPartial: vi.fn(),
      onFilesDropped: vi.fn(),
    };
  });

  describe('null/undefined handling', () => {
    it('returns unchanged whiteboard when whiteboard is null', async () => {
      const result = await convertLocalFilesToRemoteInWhiteboard(
        null as unknown as WhiteboardWithFiles,
        mockConverter
      );

      expect(result.whiteboard).toBeNull();
      expect(result.failedConversions).toEqual([]);
      expect(result.unrecoverableFiles).toEqual([]);
      expect(mockConverter).not.toHaveBeenCalled();
    });

    it('returns unchanged whiteboard when whiteboard.files is undefined', async () => {
      const whiteboard = { appState: { zoom: 1 } } as WhiteboardWithFiles;

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(result.whiteboard).toEqual(whiteboard);
      expect(result.failedConversions).toEqual([]);
      expect(result.unrecoverableFiles).toEqual([]);
      expect(mockConverter).not.toHaveBeenCalled();
    });

    it('returns unchanged whiteboard when whiteboard.files is empty', async () => {
      const whiteboard = createWhiteboard({});

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(result.whiteboard.files).toEqual({});
      expect(result.failedConversions).toEqual([]);
      expect(result.unrecoverableFiles).toEqual([]);
      expect(mockConverter).not.toHaveBeenCalled();
    });
  });

  describe('successful conversion', () => {
    it('includes successfully converted file in result', async () => {
      const file = createMockFile('file-1', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const whiteboard = createWhiteboard({ 'file-1': file });
      const convertedFile = toConvertedFile(file, 'https://storage.example.com/file-1.png');

      vi.mocked(mockConverter).mockResolvedValue(convertedFile);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      expect(result.whiteboard.files?.['file-1']).toEqual(convertedFile);
      expect(result.failedConversions).toEqual([]);
      expect(result.unrecoverableFiles).toEqual([]);
      expect(mockLogger.onFilePreservedWithDataUrl).not.toHaveBeenCalled();
      expect(mockLogger.onFileUnrecoverable).not.toHaveBeenCalled();
    });

    it('converts multiple files in parallel', async () => {
      const file1 = createMockFile('file-1', { dataURL: 'data:image/png;base64,abc1' as DataURL });
      const file2 = createMockFile('file-2', { dataURL: 'data:image/png;base64,abc2' as DataURL });
      const whiteboard = createWhiteboard({ 'file-1': file1, 'file-2': file2 });

      vi.mocked(mockConverter)
        .mockResolvedValueOnce(toConvertedFile(file1, 'https://storage.example.com/1.png'))
        .mockResolvedValueOnce(toConvertedFile(file2, 'https://storage.example.com/2.png'));

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      expect(Object.keys(result.whiteboard.files ?? {})).toHaveLength(2);
      expect(result.whiteboard.files?.['file-1']?.url).toBeDefined();
      expect(result.whiteboard.files?.['file-2']?.url).toBeDefined();
      expect(result.failedConversions).toEqual([]);
      expect(result.unrecoverableFiles).toEqual([]);
    });
  });

  describe('file preservation rules - spec requirements', () => {
    it('preserves file with dataURL when conversion fails', async () => {
      const file = createMockFile('file-1', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const whiteboard = createWhiteboard({ 'file-1': file });

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      // File should be preserved in whiteboard
      expect(result.whiteboard.files?.['file-1']).toBeDefined();
      expect(result.whiteboard.files?.['file-1']?.dataURL).toBe(file.dataURL);
      // File ID should be in failedConversions
      expect(result.failedConversions).toContain('file-1');
      expect(result.unrecoverableFiles).not.toContain('file-1');
      // Logger should be called
      expect(mockLogger.onFilePreservedWithDataUrl).toHaveBeenCalledWith('file-1');
    });

    it('preserves file with URL when conversion returns undefined', async () => {
      const file = createMockFile('file-1', { url: 'https://example.com/existing.png' });
      const whiteboard = createWhiteboard({ 'file-1': file });

      // Converter returns undefined (e.g., some edge case)
      vi.mocked(mockConverter).mockResolvedValue(undefined);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      // File should be preserved because it has url
      expect(result.whiteboard.files?.['file-1']).toBeDefined();
      expect(result.whiteboard.files?.['file-1']?.url).toBe(file.url);
      // Should NOT be in failedConversions or unrecoverableFiles
      expect(result.failedConversions).not.toContain('file-1');
      expect(result.unrecoverableFiles).not.toContain('file-1');
    });

    it('preserves file with both URL and dataURL', async () => {
      const file = createMockFile('file-1', {
        url: 'https://example.com/image.png',
        dataURL: 'data:image/png;base64,abc' as DataURL,
      });
      const whiteboard = createWhiteboard({ 'file-1': file });
      const convertedFile = toConvertedFile(file, 'https://storage.example.com/uploaded.png');

      vi.mocked(mockConverter).mockResolvedValue(convertedFile);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      expect(result.whiteboard.files?.['file-1']).toBeDefined();
      expect(result.failedConversions).toEqual([]);
      expect(result.unrecoverableFiles).toEqual([]);
    });

    it('drops unrecoverable file (no url, no dataURL)', async () => {
      const file = createMockFile('broken-file', {});
      const whiteboard = createWhiteboard({ 'broken-file': file });

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      // File should NOT be in the output
      expect(result.whiteboard.files?.['broken-file']).toBeUndefined();
      // File ID should be in unrecoverableFiles
      expect(result.unrecoverableFiles).toContain('broken-file');
      expect(result.failedConversions).not.toContain('broken-file');
      // Logger should be called
      expect(mockLogger.onFileUnrecoverable).toHaveBeenCalledWith('broken-file');
    });
  });

  describe('mixed scenarios', () => {
    it('handles mix of successful, failed, and unrecoverable files', async () => {
      const successFile = createMockFile('success', { dataURL: 'data:image/png;base64,s' as DataURL });
      const failedFile = createMockFile('failed', { dataURL: 'data:image/png;base64,f' as DataURL });
      const unrecoverableFile = createMockFile('unrecoverable', {});
      const existingUrlFile = createMockFile('existing-url', { url: 'https://example.com/existing.png' });

      const whiteboard = createWhiteboard({
        success: successFile,
        failed: failedFile,
        unrecoverable: unrecoverableFile,
        'existing-url': existingUrlFile,
      });

      vi.mocked(mockConverter).mockImplementation(async file => {
        if (file.id === 'success') {
          return toConvertedFile(file as MockFileData, 'https://storage.example.com/success.png');
        }
        if (file.id === 'existing-url') {
          return toConvertedFile(file as MockFileData, 'https://example.com/existing.png');
        }
        return undefined;
      });

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      // Successful conversion
      expect(result.whiteboard.files?.['success']).toBeDefined();
      expect(result.whiteboard.files?.['success']?.url).toBe('https://storage.example.com/success.png');

      // Failed conversion - preserved with dataURL
      expect(result.whiteboard.files?.['failed']).toBeDefined();
      expect(result.whiteboard.files?.['failed']?.dataURL).toBe(failedFile.dataURL);
      expect(result.failedConversions).toContain('failed');

      // Unrecoverable - dropped
      expect(result.whiteboard.files?.['unrecoverable']).toBeUndefined();
      expect(result.unrecoverableFiles).toContain('unrecoverable');

      // Existing URL - preserved via conversion
      expect(result.whiteboard.files?.['existing-url']).toBeDefined();
      expect(result.whiteboard.files?.['existing-url']?.url).toBe('https://example.com/existing.png');

      // Verify counts
      expect(Object.keys(result.whiteboard.files ?? {})).toHaveLength(3);
      expect(result.failedConversions).toHaveLength(1);
      expect(result.unrecoverableFiles).toHaveLength(1);
    });

    it('reports partial conversion via logger', async () => {
      const file1 = createMockFile('file-1', { dataURL: 'data:image/png;base64,1' as DataURL });
      const file2 = createMockFile('file-2', { dataURL: 'data:image/png;base64,2' as DataURL });
      const file3 = createMockFile('file-3', { dataURL: 'data:image/png;base64,3' as DataURL });

      const whiteboard = createWhiteboard({ 'file-1': file1, 'file-2': file2, 'file-3': file3 });

      vi.mocked(mockConverter).mockImplementation(async file => {
        if (file.id === 'file-1') {
          return toConvertedFile(file as MockFileData, 'https://storage.example.com/1.png');
        }
        return undefined;
      });

      await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      expect(mockLogger.onConversionPartial).toHaveBeenCalledWith(2, 3, expect.arrayContaining(['file-2', 'file-3']));
    });

    it('reports dropped files via logger', async () => {
      const goodFile = createMockFile('good', { dataURL: 'data:image/png;base64,g' as DataURL });
      const badFile1 = createMockFile('bad-1', {});
      const badFile2 = createMockFile('bad-2', {});

      const whiteboard = createWhiteboard({ good: goodFile, 'bad-1': badFile1, 'bad-2': badFile2 });

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, mockLogger);

      expect(mockLogger.onFilesDropped).toHaveBeenCalledWith(2, 3, expect.arrayContaining(['bad-1', 'bad-2']));
    });
  });

  describe('whiteboard structure preservation', () => {
    it('preserves non-file properties of whiteboard', async () => {
      interface ExtendedWhiteboard extends WhiteboardWithFiles {
        appState?: { zoom: number; scrollX: number; scrollY: number };
        elements?: Array<{ id: string; type: string }>;
        customProp?: string;
      }

      const file = createMockFile('file-1', { url: 'https://example.com/1.png' });
      const whiteboard: ExtendedWhiteboard = {
        files: { 'file-1': file } as Record<string, BinaryFileDataWithOptionalUrl>,
        appState: { zoom: 1.5, scrollX: 100, scrollY: 200 },
        elements: [{ id: 'elem-1', type: 'rectangle' }],
        customProp: 'preserved',
      };

      vi.mocked(mockConverter).mockResolvedValue(toConvertedFile(file, 'https://storage.example.com/1.png'));

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      // Non-file properties should be preserved
      expect((result.whiteboard as ExtendedWhiteboard).appState).toEqual({ zoom: 1.5, scrollX: 100, scrollY: 200 });
      expect((result.whiteboard as ExtendedWhiteboard).elements).toEqual([{ id: 'elem-1', type: 'rectangle' }]);
      expect((result.whiteboard as ExtendedWhiteboard).customProp).toBe('preserved');
    });
  });

  describe('return type contract', () => {
    it('always returns an object with whiteboard, failedConversions, and unrecoverableFiles', async () => {
      const file = createMockFile('file-1', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const whiteboard = createWhiteboard({ 'file-1': file });

      vi.mocked(mockConverter).mockResolvedValue(toConvertedFile(file, 'https://storage.example.com/1.png'));

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(result).toHaveProperty('whiteboard');
      expect(result).toHaveProperty('failedConversions');
      expect(result).toHaveProperty('unrecoverableFiles');
      expect(Array.isArray(result.failedConversions)).toBe(true);
      expect(Array.isArray(result.unrecoverableFiles)).toBe(true);
    });

    it('failedConversions contains only IDs of files that failed but have dataURL', async () => {
      const fileWithDataUrl = createMockFile('with-dataurl', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const fileWithUrl = createMockFile('with-url', { url: 'https://example.com/img.png' });
      const fileWithNeither = createMockFile('with-neither', {});

      const whiteboard = createWhiteboard({
        'with-dataurl': fileWithDataUrl,
        'with-url': fileWithUrl,
        'with-neither': fileWithNeither,
      });

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(result.failedConversions).toContain('with-dataurl');
      expect(result.failedConversions).not.toContain('with-url');
      expect(result.failedConversions).not.toContain('with-neither');
    });

    it('unrecoverableFiles contains only IDs of files with no url and no dataURL', async () => {
      const fileWithDataUrl = createMockFile('with-dataurl', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const fileWithUrl = createMockFile('with-url', { url: 'https://example.com/img.png' });
      const fileWithNeither = createMockFile('with-neither', {});

      const whiteboard = createWhiteboard({
        'with-dataurl': fileWithDataUrl,
        'with-url': fileWithUrl,
        'with-neither': fileWithNeither,
      });

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(result.unrecoverableFiles).toContain('with-neither');
      expect(result.unrecoverableFiles).not.toContain('with-dataurl');
      expect(result.unrecoverableFiles).not.toContain('with-url');
    });
  });

  describe('logger is optional', () => {
    it('works without logger', async () => {
      const file = createMockFile('file-1', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const whiteboard = createWhiteboard({ 'file-1': file });

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      // Should not throw without logger
      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(result.failedConversions).toContain('file-1');
    });

    it('handles partial logger (only some callbacks)', async () => {
      const file = createMockFile('file-1', {});
      const whiteboard = createWhiteboard({ 'file-1': file });
      const partialLogger: ConversionLogger = {
        onFileUnrecoverable: vi.fn(),
        // other callbacks not provided
      };

      vi.mocked(mockConverter).mockResolvedValue(undefined);

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter, partialLogger);

      expect(partialLogger.onFileUnrecoverable).toHaveBeenCalledWith('file-1');
      expect(result.unrecoverableFiles).toContain('file-1');
    });
  });

  describe('edge cases', () => {
    it('handles converter that throws', async () => {
      const file = createMockFile('file-1', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const whiteboard = createWhiteboard({ 'file-1': file });

      vi.mocked(mockConverter).mockRejectedValue(new Error('Upload failed'));

      await expect(convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter)).rejects.toThrow('Upload failed');
    });

    it('preserves file ID as key in output files', async () => {
      const file = createMockFile('my-unique-id', { dataURL: 'data:image/png;base64,abc' as DataURL });
      const whiteboard = createWhiteboard({ 'my-unique-id': file });

      vi.mocked(mockConverter).mockResolvedValue(toConvertedFile(file, 'https://storage.example.com/file.png'));

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(Object.keys(result.whiteboard.files ?? {})).toContain('my-unique-id');
    });

    it('handles large number of files', async () => {
      const files: Record<string, MockFileData> = {};
      for (let i = 0; i < 100; i++) {
        files[`file-${i}`] = createMockFile(`file-${i}`, { dataURL: `data:image/png;base64,${i}` as DataURL });
      }
      const whiteboard = createWhiteboard(files);

      vi.mocked(mockConverter).mockImplementation(async file =>
        toConvertedFile(file as MockFileData, `https://storage.example.com/${file.id}.png`)
      );

      const result = await convertLocalFilesToRemoteInWhiteboard(whiteboard, mockConverter);

      expect(Object.keys(result.whiteboard.files ?? {})).toHaveLength(100);
      expect(result.failedConversions).toHaveLength(0);
      expect(result.unrecoverableFiles).toHaveLength(0);
    });
  });
});
