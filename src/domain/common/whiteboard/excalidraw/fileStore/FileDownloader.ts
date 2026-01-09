import { error, TagCategoryValues } from '@/core/logging/sentry/log';
import { fetchFileToDataURL } from './fileConverters';
import type { BinaryFileDataWithUrl, BinaryFileDataWithOptionalUrl } from '../types';

export interface DownloadOptions {
  guestName?: string | null;
}

export interface DownloadResult {
  succeeded: BinaryFileDataWithUrl[];
  failed: Array<{ fileId: string; error: string }>;
}

/**
 * Handles downloading files from remote URLs and converting to dataURLs.
 * Single Responsibility: File download orchestration.
 */
export class FileDownloader {
  async downloadFile(file: BinaryFileDataWithOptionalUrl, options?: DownloadOptions): Promise<BinaryFileDataWithUrl> {
    if (!file.url) {
      error(`Cannot download file - missing URL: ${file.id}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'download-missing-url',
      });
      throw new Error(`Cannot download: ${file.id}`);
    }

    const headers: Record<string, string> = {};
    if (options?.guestName) {
      headers['x-guest-name'] = options.guestName;
    }

    try {
      const dataURL = await fetchFileToDataURL(file.url, headers);
      return { ...file, url: file.url, dataURL };
    } catch (e) {
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
    const failed: Array<{ fileId: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value);
      } else {
        failed.push({
          fileId: files[index].id,
          error: result.reason?.message || 'Unknown error',
        });
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
}
