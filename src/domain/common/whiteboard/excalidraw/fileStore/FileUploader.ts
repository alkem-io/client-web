import type { FetchResult } from '@apollo/client';
import { error, TagCategoryValues } from '@/core/logging/sentry/log';
import { excalidrawFileMimeType, generateIdFromFile } from '../collab/utils';
import { blobToDataURL } from './fileConverters';
import type { BinaryFileDataWithUrl } from '../types';
import type { UploadFileMutation } from '@/core/apollo/generated/graphql-schema';

export interface UploadResult {
  id: string;
  url: string;
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
  constructor(
    private config: FileUploaderConfig,
    private uploadMutation: (variables: {
      file: File;
      uploadData: { storageBucketId: string };
    }) => Promise<FetchResult<UploadFileMutation>>
  ) {}

  async upload(file: File): Promise<UploadResult> {
    const fileId = await generateIdFromFile(file);
    const { storageBucketId, allowFallbackToAttached } = this.config;

    if (!storageBucketId) {
      if (allowFallbackToAttached) {
        return { id: fileId, url: '' };
      }
      const errorMessage = `Missing StorageBucket: Uploading images to this whiteboard is not supported (fileId: ${fileId}, fileName: ${file.name})`;
      error(errorMessage, { category: TagCategoryValues.WHITEBOARD, label: 'upload-no-storage-bucket' });
      throw new Error(errorMessage);
    }

    const { data, errors } = await this.uploadMutation({
      file,
      uploadData: { storageBucketId },
    });

    if (!data?.uploadFileOnStorageBucket.url || errors) {
      const errorMessage = `Failed to upload file to storage: ${errors?.[0]?.message || 'Unknown upload error'} (fileId: ${fileId}, fileName: ${file.name})`;
      error(errorMessage, { category: TagCategoryValues.WHITEBOARD, label: 'upload-failed' });
      throw new Error(errors?.[0]?.message || 'Upload failed');
    }

    return {
      id: fileId,
      url: data.uploadFileOnStorageBucket.url,
    };
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
