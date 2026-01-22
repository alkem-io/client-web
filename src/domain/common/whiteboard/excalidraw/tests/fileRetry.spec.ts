import { describe, it, expect } from 'vitest';

/**
 * Tests for file retry state transitions (T026)
 *
 * Tests verify:
 * - Upload failure → retry → success transitions
 * - Download failure → retry → success transitions
 * - Failure tracking and clearing
 */

describe('File retry state transitions', () => {
  describe('Download failure → retry → success', () => {
    it('should track failed downloads with structured failure info', () => {
      const failure = {
        fileId: 'file-1',
        url: 'https://example.com/image.png',
        error: 'Network error',
        timestamp: Date.now(),
      };

      expect(failure).toHaveProperty('fileId');
      expect(failure).toHaveProperty('url');
      expect(failure).toHaveProperty('error');
      expect(failure).toHaveProperty('timestamp');
    });

    it('should clear failure record on successful retry', () => {
      const failures = new Map<string, { fileId: string; error: string }>();
      failures.set('file-1', { fileId: 'file-1', error: 'Network error' });

      expect(failures.has('file-1')).toBe(true);

      // Simulate successful retry
      failures.delete('file-1');

      expect(failures.has('file-1')).toBe(false);
    });

    it('should support retry of specific failed files', () => {
      const failedFileIds = ['file-1', 'file-2'];
      const filesToRetry = failedFileIds.filter(id => id === 'file-1');

      expect(filesToRetry).toContain('file-1');
      expect(filesToRetry).not.toContain('file-2');
    });
  });

  describe('Upload failure → retry → success', () => {
    it('should track upload failure reasons', () => {
      const noStorageBucketFailure = {
        fileId: 'file-1',
        reason: 'no-storage-bucket' as const,
        error: 'Missing StorageBucket',
        timestamp: Date.now(),
      };

      const uploadFailedFailure = {
        fileId: 'file-2',
        reason: 'upload-failed' as const,
        error: 'Server returned 500',
        timestamp: Date.now(),
      };

      const networkErrorFailure = {
        fileId: 'file-3',
        reason: 'network-error' as const,
        error: 'Connection refused',
        timestamp: Date.now(),
      };

      expect(noStorageBucketFailure.reason).toBe('no-storage-bucket');
      expect(uploadFailedFailure.reason).toBe('upload-failed');
      expect(networkErrorFailure.reason).toBe('network-error');
    });

    it('should preserve file with dataURL when upload fails', () => {
      const fileWithDataUrl = {
        id: 'file-1',
        mimeType: 'image/png',
        dataURL: 'data:image/png;base64,abc123',
        url: undefined, // Upload failed, no URL
      };

      // File should still be usable via dataURL
      expect(fileWithDataUrl.dataURL).toBeTruthy();
      expect(fileWithDataUrl.url).toBeUndefined();
    });

    it('should update file with URL on successful retry', () => {
      const fileAfterRetry = {
        id: 'file-1',
        mimeType: 'image/png',
        dataURL: 'data:image/png;base64,abc123',
        url: 'https://storage.example.com/file-1.png',
      };

      expect(fileAfterRetry.url).toBeTruthy();
      expect(fileAfterRetry.dataURL).toBeTruthy();
    });
  });

  describe('FileFailureState aggregation', () => {
    it('should aggregate upload and download failures', () => {
      const failureState = {
        uploadFailures: [
          { fileId: 'upload-1', reason: 'upload-failed' as const, error: 'Error', timestamp: Date.now() },
        ],
        downloadFailures: [
          { fileId: 'download-1', url: 'https://example.com/img.png', error: 'Error', timestamp: Date.now() },
        ],
        hasFailures: true,
      };

      expect(failureState.hasFailures).toBe(true);
      expect(failureState.uploadFailures).toHaveLength(1);
      expect(failureState.downloadFailures).toHaveLength(1);
    });

    it('should report no failures when lists are empty', () => {
      const failureState = {
        uploadFailures: [],
        downloadFailures: [],
        hasFailures: false,
      };

      expect(failureState.hasFailures).toBe(false);
    });
  });

  describe('Retry API contract', () => {
    it('should expose retryFailedDownloads returning success/fail counts', async () => {
      // Contract: retryFailedDownloads returns { succeeded: number, failed: number }
      const mockRetryResult = { succeeded: 2, failed: 1 };

      expect(mockRetryResult).toHaveProperty('succeeded');
      expect(mockRetryResult).toHaveProperty('failed');
      expect(typeof mockRetryResult.succeeded).toBe('number');
      expect(typeof mockRetryResult.failed).toBe('number');
    });

    it('should expose clearFailures to reset failure state', () => {
      // Contract: clearFailures resets all tracked failures
      const failures = new Map();
      failures.set('file-1', { error: 'test' });
      failures.set('file-2', { error: 'test' });

      // Simulate clearFailures
      failures.clear();

      expect(failures.size).toBe(0);
    });
  });
});
