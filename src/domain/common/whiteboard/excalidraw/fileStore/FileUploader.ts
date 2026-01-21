import type { FetchResult } from '@apollo/client';
import { error, TagCategoryValues } from '@/core/logging/sentry/log';
import { excalidrawFileMimeType, generateIdFromFile } from '../collab/utils';
import { blobToDataURL } from './fileConverters';
import type { BinaryFileDataWithUrl, BinaryFileDataWithOptionalUrl } from '../types';
import type { UploadFileMutation } from '@/core/apollo/generated/graphql-schema';

export interface UploadResult {
  id: string;
  url: string;
}

export type UploadFailureReason = 'no-storage-bucket' | 'upload-failed' | 'network-error';

export interface UploadFailure {
  fileId: string;
  reason: UploadFailureReason;
  error: string;
  timestamp: number;
}

export interface FileUploaderConfig {
  storageBucketId?: string;
  allowFallbackToAttached?: boolean;
}

/**
 * Handles uploading files to the storage bucket.
 * Single Responsibility: File upload orchestration.
 */
export class FileUploader {
  private failedUploads: Map<string, UploadFailure> = new Map();

  constructor(
    private getConfig: () => FileUploaderConfig,
    private uploadMutation: (variables: {
      file: File;
      uploadData: { storageBucketId: string };
    }) => Promise<FetchResult<UploadFileMutation>>
  ) {}

  /**
   * Get list of files that failed to upload
   */
  getFailedUploads(): UploadFailure[] {
    return Array.from(this.failedUploads.values());
  }

  /**
   * Clear a failed upload record after successful retry
   */
  clearFailure(fileId: string): void {
    this.failedUploads.delete(fileId);
  }

  /**
   * Clear all failed upload records
   */
  clearAllFailures(): void {
    this.failedUploads.clear();
  }

  /**
   * Create file data without uploading (side-effect free).
   * Returns file metadata with dataURL but no URL yet.
   * Use this for immediate file registration without blocking on network.
   */
  async createFileData(file: File): Promise<BinaryFileDataWithOptionalUrl> {
    const fileId = await generateIdFromFile(file);
    const dataURL = await blobToDataURL(file);

    return {
      id: fileId,
      mimeType: excalidrawFileMimeType(file.type),
      created: Date.now(),
      dataURL,
      // url is intentionally omitted - will be set after async upload
    };
  }

  async upload(file: File): Promise<UploadResult> {
    const fileId = await generateIdFromFile(file);
    const { storageBucketId, allowFallbackToAttached } = this.getConfig();

    if (!storageBucketId) {
      if (allowFallbackToAttached) {
        return { id: fileId, url: '' };
      }
      const errorMessage = `Missing StorageBucket: Uploading images to this whiteboard is not supported`;
      const failure: UploadFailure = {
        fileId,
        reason: 'no-storage-bucket',
        error: errorMessage,
        timestamp: Date.now(),
      };
      this.failedUploads.set(fileId, failure);
      error(`${errorMessage} (fileId: ${fileId}, fileName: ${file.name})`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'upload-no-storage-bucket',
      });
      throw new Error(errorMessage);
    }

    try {
      const { data, errors } = await this.uploadMutation({
        file,
        uploadData: { storageBucketId },
      });

      if (!data?.uploadFileOnStorageBucket.url || errors) {
        const errorMessage = errors?.[0]?.message || 'Unknown upload error';
        const failure: UploadFailure = {
          fileId,
          reason: 'upload-failed',
          error: errorMessage,
          timestamp: Date.now(),
        };
        this.failedUploads.set(fileId, failure);
        error(`Failed to upload file to storage: ${errorMessage} (fileId: ${fileId}, fileName: ${file.name})`, {
          category: TagCategoryValues.WHITEBOARD,
          label: 'upload-failed',
        });
        throw new Error(errorMessage);
      }

      // Success - clear any previous failure record
      this.failedUploads.delete(fileId);
      return {
        id: fileId,
        url: data.uploadFileOnStorageBucket.url,
      };
    } catch (e) {
      // If not already tracked as a specific failure type, track as network error
      if (!this.failedUploads.has(fileId)) {
        const failure: UploadFailure = {
          fileId,
          reason: 'network-error',
          error: e instanceof Error ? e.message : 'Unknown error',
          timestamp: Date.now(),
        };
        this.failedUploads.set(fileId, failure);
      }
      throw e;
    }
  }

  async uploadAndCreateFileData(file: File): Promise<BinaryFileDataWithUrl> {
    const fileId = await generateIdFromFile(file);
    const { url } = await this.upload(file);
    const dataURL = await blobToDataURL(file);

    return {
      id: fileId,
      mimeType: excalidrawFileMimeType(file.type),
      created: Date.now(),
      url,
      dataURL,
    };
  }
}
