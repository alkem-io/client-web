import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { DataURL } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { FileId } from '@alkemio/excalidraw/dist/types/element/src/types';
import { FileDownloader, type DownloadFailure } from '../fileStore/FileDownloader';
import { FileUploader, type UploadFailure } from '../fileStore/FileUploader';
import type { BinaryFileDataWithOptionalUrl } from '../types';

// Mock the dependencies
vi.mock('../fileStore/fileConverters', () => ({
  fetchFileToDataURL: vi.fn(),
  blobToDataURL: vi.fn(),
}));

vi.mock('../collab/utils', () => ({
  generateIdFromFile: vi.fn(),
  excalidrawFileMimeType: vi.fn((type: string) => type),
}));

vi.mock('@/core/logging/sentry/log', () => ({
  error: vi.fn(),
  TagCategoryValues: { WHITEBOARD: 'whiteboard' },
}));

// Import mocked modules
import { fetchFileToDataURL, blobToDataURL } from '../fileStore/fileConverters';
import { generateIdFromFile } from '../collab/utils';

/**
 * Implementation tests for file retry mechanisms (T026)
 *
 * These tests verify the actual implementation of:
 * - FileDownloader: download failures, tracking, and retry
 * - FileUploader: upload failures, tracking, and recovery
 */

// Test data factories
const createMockFile = (
  id: string,
  options: { url?: string; dataURL?: DataURL } = {}
): BinaryFileDataWithOptionalUrl =>
  ({
    id,
    mimeType: 'image/png',
    created: Date.now(),
    ...options,
  }) as BinaryFileDataWithOptionalUrl;

describe('FileDownloader implementation', () => {
  let downloader: FileDownloader;

  beforeEach(() => {
    vi.clearAllMocks();
    downloader = new FileDownloader();
  });

  describe('downloadFile', () => {
    it('downloads file successfully and returns file with dataURL', async () => {
      const file = createMockFile('file-1', { url: 'https://example.com/image.png' });
      const mockDataURL = 'data:image/png;base64,abc123' as DataURL;
      vi.mocked(fetchFileToDataURL).mockResolvedValue(mockDataURL);

      const result = await downloader.downloadFile(file);

      expect(result.id).toBe('file-1');
      expect(result.url).toBe('https://example.com/image.png');
      expect(result.dataURL).toBe(mockDataURL);
      expect(fetchFileToDataURL).toHaveBeenCalledWith('https://example.com/image.png', {});
    });

    it('passes guest name header when provided', async () => {
      const file = createMockFile('file-1', { url: 'https://example.com/image.png' });
      vi.mocked(fetchFileToDataURL).mockResolvedValue('data:image/png;base64,abc' as DataURL);

      await downloader.downloadFile(file, { guestName: 'Alice' });

      expect(fetchFileToDataURL).toHaveBeenCalledWith('https://example.com/image.png', expect.objectContaining({
        'x-guest-name': expect.any(String),
      }));
    });

    it('throws and tracks failure when file has no URL', async () => {
      const file = createMockFile('file-1', {}); // No URL

      await expect(downloader.downloadFile(file)).rejects.toThrow('Cannot download: file-1');

      const failures = downloader.getFailedDownloads();
      expect(failures).toHaveLength(1);
      expect(failures[0].fileId).toBe('file-1');
      expect(failures[0].error).toBe('Missing URL');
    });

    it('throws and tracks failure when fetch fails', async () => {
      const file = createMockFile('file-1', { url: 'https://example.com/image.png' });
      vi.mocked(fetchFileToDataURL).mockRejectedValue(new Error('Network error'));

      await expect(downloader.downloadFile(file)).rejects.toThrow('Network error');

      const failures = downloader.getFailedDownloads();
      expect(failures).toHaveLength(1);
      expect(failures[0].fileId).toBe('file-1');
      expect(failures[0].url).toBe('https://example.com/image.png');
      expect(failures[0].error).toBe('Network error');
    });

    it('clears failure record on successful download after previous failure', async () => {
      const file = createMockFile('file-1', { url: 'https://example.com/image.png' });

      // First attempt fails
      vi.mocked(fetchFileToDataURL).mockRejectedValueOnce(new Error('Network error'));
      await expect(downloader.downloadFile(file)).rejects.toThrow();
      expect(downloader.getFailedDownloads()).toHaveLength(1);

      // Second attempt succeeds
      vi.mocked(fetchFileToDataURL).mockResolvedValueOnce('data:image/png;base64,abc' as DataURL);
      await downloader.downloadFile(file);

      expect(downloader.getFailedDownloads()).toHaveLength(0);
    });
  });

  describe('downloadMultiple', () => {
    it('downloads multiple files successfully', async () => {
      const files = [
        createMockFile('file-1', { url: 'https://example.com/1.png' }),
        createMockFile('file-2', { url: 'https://example.com/2.png' }),
      ];
      vi.mocked(fetchFileToDataURL)
        .mockResolvedValueOnce('data:image/png;base64,1' as DataURL)
        .mockResolvedValueOnce('data:image/png;base64,2' as DataURL);

      const result = await downloader.downloadMultiple(files);

      expect(result.succeeded).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.succeeded[0].id).toBe('file-1');
      expect(result.succeeded[1].id).toBe('file-2');
    });

    it('handles partial failures and tracks them', async () => {
      const files = [
        createMockFile('file-1', { url: 'https://example.com/1.png' }),
        createMockFile('file-2', { url: 'https://example.com/2.png' }),
        createMockFile('file-3', { url: 'https://example.com/3.png' }),
      ];
      vi.mocked(fetchFileToDataURL)
        .mockResolvedValueOnce('data:image/png;base64,1' as DataURL)
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce('data:image/png;base64,3' as DataURL);

      const result = await downloader.downloadMultiple(files);

      expect(result.succeeded).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].fileId).toBe('file-2');
      expect(result.failed[0].error).toBe('File not found');

      // Verify failure is tracked
      const trackedFailures = downloader.getFailedDownloads();
      expect(trackedFailures).toHaveLength(1);
      expect(trackedFailures[0].fileId).toBe('file-2');
    });

    it('returns empty results for empty input', async () => {
      const result = await downloader.downloadMultiple([]);

      expect(result.succeeded).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });
  });

  describe('retryFailed', () => {
    it('retries only previously failed downloads', async () => {
      const file1 = createMockFile('file-1', { url: 'https://example.com/1.png' });
      const file2 = createMockFile('file-2', { url: 'https://example.com/2.png' });

      // Initial download - file-2 fails
      vi.mocked(fetchFileToDataURL)
        .mockResolvedValueOnce('data:image/png;base64,1' as DataURL)
        .mockRejectedValueOnce(new Error('Network error'));
      await downloader.downloadMultiple([file1, file2]);

      expect(downloader.getFailedDownloads()).toHaveLength(1);

      // Retry - file-2 succeeds
      vi.mocked(fetchFileToDataURL).mockResolvedValueOnce('data:image/png;base64,2' as DataURL);
      const getFile = (id: string) => (id === 'file-2' ? file2 : undefined);
      const result = await downloader.retryFailed(getFile);

      expect(result.succeeded).toHaveLength(1);
      expect(result.succeeded[0].id).toBe('file-2');
      expect(downloader.getFailedDownloads()).toHaveLength(0);
    });

    it('returns empty result when no failures to retry', async () => {
      const result = await downloader.retryFailed(() => undefined);

      expect(result.succeeded).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });

    it('skips files that cannot be resolved by getFile', async () => {
      // Create initial failure
      const file = createMockFile('file-1', { url: 'https://example.com/1.png' });
      vi.mocked(fetchFileToDataURL).mockRejectedValueOnce(new Error('Error'));
      await downloader.downloadMultiple([file]);

      // Retry but getFile returns undefined
      const result = await downloader.retryFailed(() => undefined);

      expect(result.succeeded).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });

    it('updates failure tracking on retry failure', async () => {
      const file = createMockFile('file-1', { url: 'https://example.com/1.png' });

      // Initial failure
      vi.mocked(fetchFileToDataURL).mockRejectedValueOnce(new Error('First error'));
      await downloader.downloadMultiple([file]);

      const firstFailure = downloader.getFailedDownloads()[0];
      expect(firstFailure.error).toBe('First error');

      // Retry also fails with different error
      vi.mocked(fetchFileToDataURL).mockRejectedValueOnce(new Error('Second error'));
      await downloader.retryFailed(id => (id === 'file-1' ? file : undefined));

      const secondFailure = downloader.getFailedDownloads()[0];
      expect(secondFailure.error).toBe('Second error');
      expect(secondFailure.timestamp).toBeGreaterThanOrEqual(firstFailure.timestamp);
    });
  });

  describe('failure tracking methods', () => {
    it('getFailedDownloads returns all tracked failures', async () => {
      const files = [
        createMockFile('file-1', { url: 'https://example.com/1.png' }),
        createMockFile('file-2', { url: 'https://example.com/2.png' }),
      ];
      vi.mocked(fetchFileToDataURL)
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      await downloader.downloadMultiple(files);

      const failures = downloader.getFailedDownloads();
      expect(failures).toHaveLength(2);
      expect(failures.map(f => f.fileId)).toContain('file-1');
      expect(failures.map(f => f.fileId)).toContain('file-2');
    });

    it('clearFailure removes specific failure', async () => {
      const files = [
        createMockFile('file-1', { url: 'https://example.com/1.png' }),
        createMockFile('file-2', { url: 'https://example.com/2.png' }),
      ];
      vi.mocked(fetchFileToDataURL)
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));
      await downloader.downloadMultiple(files);

      downloader.clearFailure('file-1');

      const failures = downloader.getFailedDownloads();
      expect(failures).toHaveLength(1);
      expect(failures[0].fileId).toBe('file-2');
    });

    it('clearAllFailures removes all failures', async () => {
      const files = [
        createMockFile('file-1', { url: 'https://example.com/1.png' }),
        createMockFile('file-2', { url: 'https://example.com/2.png' }),
      ];
      vi.mocked(fetchFileToDataURL)
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));
      await downloader.downloadMultiple(files);

      downloader.clearAllFailures();

      expect(downloader.getFailedDownloads()).toHaveLength(0);
    });
  });
});

describe('FileUploader implementation', () => {
  let uploader: FileUploader;
  let mockUploadMutation: Mock;
  let mockGetConfig: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadMutation = vi.fn();
    mockGetConfig = vi.fn().mockReturnValue({ storageBucketId: 'bucket-123' });
    uploader = new FileUploader(mockGetConfig, mockUploadMutation);

    // Default mocks for file processing
    vi.mocked(generateIdFromFile).mockResolvedValue('generated-id' as FileId);
    vi.mocked(blobToDataURL).mockResolvedValue('data:image/png;base64,xyz' as DataURL);
  });

  describe('upload', () => {
    it('uploads file successfully and returns URL', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      mockUploadMutation.mockResolvedValue({
        data: { uploadFileOnStorageBucket: { url: 'https://storage.example.com/file.png' } },
      });

      const result = await uploader.upload(file);

      expect(result.id).toBe('generated-id');
      expect(result.url).toBe('https://storage.example.com/file.png');
      expect(mockUploadMutation).toHaveBeenCalledWith({
        file,
        uploadData: { storageBucketId: 'bucket-123' },
      });
    });

    it('clears failure record on successful upload after previous failure', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });

      // First attempt fails
      mockUploadMutation.mockRejectedValueOnce(new Error('Network error'));
      await expect(uploader.upload(file)).rejects.toThrow();
      expect(uploader.getFailedUploads()).toHaveLength(1);

      // Second attempt succeeds
      mockUploadMutation.mockResolvedValueOnce({
        data: { uploadFileOnStorageBucket: { url: 'https://storage.example.com/file.png' } },
      });
      await uploader.upload(file);

      expect(uploader.getFailedUploads()).toHaveLength(0);
    });

    it('throws and tracks no-storage-bucket failure', async () => {
      mockGetConfig.mockReturnValue({ storageBucketId: undefined });
      const file = new File(['content'], 'test.png', { type: 'image/png' });

      await expect(uploader.upload(file)).rejects.toThrow('Missing StorageBucket');

      const failures = uploader.getFailedUploads();
      expect(failures).toHaveLength(1);
      expect(failures[0].reason).toBe('no-storage-bucket');
      expect(failures[0].fileId).toBe('generated-id');
    });

    it('allows fallback when allowFallbackToAttached is true', async () => {
      mockGetConfig.mockReturnValue({ storageBucketId: undefined, allowFallbackToAttached: true });
      const file = new File(['content'], 'test.png', { type: 'image/png' });

      const result = await uploader.upload(file);

      expect(result.id).toBe('generated-id');
      expect(result.url).toBe('');
      expect(uploader.getFailedUploads()).toHaveLength(0);
    });

    it('throws and tracks upload-failed when mutation returns error', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      mockUploadMutation.mockResolvedValue({
        data: null,
        errors: [{ message: 'Storage quota exceeded' }],
      });

      await expect(uploader.upload(file)).rejects.toThrow('Storage quota exceeded');

      const failures = uploader.getFailedUploads();
      expect(failures).toHaveLength(1);
      expect(failures[0].reason).toBe('upload-failed');
      expect(failures[0].error).toBe('Storage quota exceeded');
    });

    it('throws and tracks network-error when mutation throws', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      mockUploadMutation.mockRejectedValue(new Error('Connection refused'));

      await expect(uploader.upload(file)).rejects.toThrow('Connection refused');

      const failures = uploader.getFailedUploads();
      expect(failures).toHaveLength(1);
      expect(failures[0].reason).toBe('network-error');
      expect(failures[0].error).toBe('Connection refused');
    });
  });

  describe('createFileData', () => {
    it('creates file data without uploading', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      vi.mocked(blobToDataURL).mockResolvedValue('data:image/png;base64,content' as DataURL);

      const result = await uploader.createFileData(file);

      expect(result.id).toBe('generated-id');
      expect(result.mimeType).toBe('image/png');
      expect(result.dataURL).toBe('data:image/png;base64,content');
      expect(result.url).toBeUndefined();
      expect(mockUploadMutation).not.toHaveBeenCalled();
    });
  });

  describe('uploadAndCreateFileData', () => {
    it('uploads and returns complete file data', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      mockUploadMutation.mockResolvedValue({
        data: { uploadFileOnStorageBucket: { url: 'https://storage.example.com/file.png' } },
      });

      const result = await uploader.uploadAndCreateFileData(file);

      expect(result.id).toBe('generated-id');
      expect(result.url).toBe('https://storage.example.com/file.png');
      expect(result.dataURL).toBe('data:image/png;base64,xyz');
      expect(result.mimeType).toBe('image/png');
    });
  });

  describe('failure tracking methods', () => {
    it('getFailedUploads returns all tracked failures', async () => {
      const file1 = new File(['1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['2'], 'test2.png', { type: 'image/png' });

      vi.mocked(generateIdFromFile)
        .mockResolvedValueOnce('file-1' as FileId)
        .mockResolvedValueOnce('file-2' as FileId);
      mockUploadMutation
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      await expect(uploader.upload(file1)).rejects.toThrow();
      await expect(uploader.upload(file2)).rejects.toThrow();

      const failures = uploader.getFailedUploads();
      expect(failures).toHaveLength(2);
      expect(failures.map(f => f.fileId)).toContain('file-1');
      expect(failures.map(f => f.fileId)).toContain('file-2');
    });

    it('clearFailure removes specific failure', async () => {
      const file1 = new File(['1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['2'], 'test2.png', { type: 'image/png' });

      vi.mocked(generateIdFromFile)
        .mockResolvedValueOnce('file-1' as FileId)
        .mockResolvedValueOnce('file-2' as FileId);
      mockUploadMutation
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      await expect(uploader.upload(file1)).rejects.toThrow();
      await expect(uploader.upload(file2)).rejects.toThrow();

      uploader.clearFailure('file-1');

      const failures = uploader.getFailedUploads();
      expect(failures).toHaveLength(1);
      expect(failures[0].fileId).toBe('file-2');
    });

    it('clearAllFailures removes all failures', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      mockUploadMutation.mockRejectedValue(new Error('Error'));

      await expect(uploader.upload(file)).rejects.toThrow();
      expect(uploader.getFailedUploads()).toHaveLength(1);

      uploader.clearAllFailures();

      expect(uploader.getFailedUploads()).toHaveLength(0);
    });
  });
});

describe('Failure type structure validation', () => {
  it('DownloadFailure has required properties', () => {
    const failure: DownloadFailure = {
      fileId: 'file-1',
      url: 'https://example.com/image.png',
      error: 'Network error',
      timestamp: Date.now(),
    };

    expect(failure).toHaveProperty('fileId');
    expect(failure).toHaveProperty('error');
    expect(failure).toHaveProperty('timestamp');
    expect(typeof failure.timestamp).toBe('number');
  });

  it('UploadFailure has required properties including reason', () => {
    const failure: UploadFailure = {
      fileId: 'file-1',
      reason: 'upload-failed',
      error: 'Server error',
      timestamp: Date.now(),
    };

    expect(failure).toHaveProperty('fileId');
    expect(failure).toHaveProperty('reason');
    expect(failure).toHaveProperty('error');
    expect(failure).toHaveProperty('timestamp');
    expect(['no-storage-bucket', 'upload-failed', 'network-error']).toContain(failure.reason);
  });
});
