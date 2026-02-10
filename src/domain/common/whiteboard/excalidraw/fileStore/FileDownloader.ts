import { error, TagCategoryValues } from '@/core/logging/sentry/log';
import { encodeToBase64 } from '@/core/utils/encodeToBase64';
import { fetchFileToDataURL } from './fileConverters';
import type { BinaryFileDataWithUrl, BinaryFileDataWithOptionalUrl } from '../types';

export interface DownloadOptions {
  guestName?: string | null;
}

export interface DownloadFailure {
  fileId: string;
  url?: string;
  error: string;
  timestamp: number;
}

export interface DownloadResult {
  succeeded: BinaryFileDataWithUrl[];
  failed: DownloadFailure[];
}

/**
 * Handles downloading files from remote URLs and converting to dataURLs.
 * Single Responsibility: File download orchestration.
 */
export class FileDownloader {
  private failedDownloads: Map<string, DownloadFailure> = new Map();

  /**
   * Get list of files that failed to download
   */
  getFailedDownloads(): DownloadFailure[] {
    return Array.from(this.failedDownloads.values());
  }

  /**
   * Clear a failed download record after successful retry
   */
  clearFailure(fileId: string): void {
    this.failedDownloads.delete(fileId);
  }

  /**
   * Clear all failed download records
   */
  clearAllFailures(): void {
    this.failedDownloads.clear();
  }

  async downloadFile(file: BinaryFileDataWithOptionalUrl, options?: DownloadOptions): Promise<BinaryFileDataWithUrl> {
    if (!file.url) {
      const failure: DownloadFailure = {
        fileId: file.id,
        error: 'Missing URL',
        timestamp: Date.now(),
      };
      this.failedDownloads.set(file.id, failure);
      error(`Cannot download file - missing URL: ${file.id}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'download-missing-url',
      });
      throw new Error(`Cannot download: ${file.id}`);
    }

    const headers: Record<string, string> = {};
    if (options?.guestName) {
      headers['x-guest-name'] = encodeToBase64(options.guestName);
    }

    try {
      const dataURL = await fetchFileToDataURL(file.url, headers);
      // Success - clear any previous failure record
      this.failedDownloads.delete(file.id);
      return { ...file, url: file.url, dataURL };
    } catch (e) {
      const failure: DownloadFailure = {
        fileId: file.id,
        url: file.url,
        error: e instanceof Error ? e.message : 'Unknown error',
        timestamp: Date.now(),
      };
      this.failedDownloads.set(file.id, failure);
      error(`Error downloading file: ${file.url}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'download-fetch-failed',
      });
      throw e;
    }
  }

  async downloadMultiple(files: BinaryFileDataWithOptionalUrl[], options?: DownloadOptions): Promise<DownloadResult> {
    const results = await Promise.allSettled(files.map(file => this.downloadFile(file, options)));

    const succeeded: BinaryFileDataWithUrl[] = [];
    const failed: DownloadFailure[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value);
      } else {
        const file = files[index];
        const failure: DownloadFailure = {
          fileId: file.id,
          url: file.url,
          error: result.reason?.message || 'Unknown error',
          timestamp: Date.now(),
        };
        this.failedDownloads.set(file.id, failure);
        failed.push(failure);
      }
    });

    if (failed.length > 0) {
      const reasons = failed.map(f => f.error).join(', ');
      error(`Failed to download ${failed.length} of ${files.length} whiteboard files: ${reasons}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'download-batch-failures',
      });
    }

    return { succeeded, failed };
  }

  /**
   * Retry downloading files that previously failed
   */
  async retryFailed(
    getFile: (fileId: string) => BinaryFileDataWithOptionalUrl | undefined,
    options?: DownloadOptions
  ): Promise<DownloadResult> {
    const failedFiles = Array.from(this.failedDownloads.keys())
      .map(fileId => getFile(fileId))
      .filter((file): file is BinaryFileDataWithOptionalUrl => file !== undefined);

    if (failedFiles.length === 0) {
      return { succeeded: [], failed: [] };
    }

    return this.downloadMultiple(failedFiles, options);
  }
}
