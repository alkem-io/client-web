import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import type {
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { error, TagCategoryValues } from '@/core/logging/sentry/log';
import { GuestSessionContext } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import Semaphore from 'ts-semaphore';
import { dataUrlToFile } from './fileStore/fileConverters';
import { WhiteboardFileCache } from './fileStore/WhiteboardFileCache';
import { FileUploader, type UploadFailure } from './fileStore/FileUploader';
import { FileDownloader, type DownloadFailure } from './fileStore/FileDownloader';
import {
  validateWhiteboardImageFile,
  type ImageValidationResult,
} from './fileStore/fileValidation';
import type {
  BinaryFileDataWithUrl,
  BinaryFileDataWithOptionalUrl,
  BinaryFilesWithUrl,
  BinaryFilesWithOptionalUrl,
  WhiteboardWithFiles,
} from './types';

// Re-export types for backward compatibility
export type {
  BinaryFileDataWithUrl,
  BinaryFileDataWithOptionalUrl,
  BinaryFilesWithUrl,
  BinaryFilesWithOptionalUrl,
  WhiteboardWithFiles,
} from './types';

interface Props {
  storageBucketId?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  allowFallbackToAttached?: boolean;
}

export interface ConversionResult<W> {
  whiteboard: W;
  failedConversions: string[];
  unrecoverableFiles: string[];
}

export interface FileFailureState {
  uploadFailures: UploadFailure[];
  downloadFailures: DownloadFailure[];
  hasFailures: boolean;
}

export interface WhiteboardFilesManager {
  addNewFile: (file: File) => Promise<string>;
  validateFile: (file: File) => ImageValidationResult;
  loadFiles: (data: WhiteboardWithFiles) => Promise<void>;
  getUploadedFiles: (filesInExcalidraw: BinaryFiles) => Promise<BinaryFilesWithOptionalUrl>;
  pushFilesToExcalidraw: () => Promise<void>;
  convertLocalFilesToRemoteInWhiteboard: <W extends WhiteboardWithFiles>(
    whiteboard: W
  ) => Promise<ConversionResult<W>>;
  convertLocalFileToRemote: (file: BinaryFileData & { url?: string }) => Promise<BinaryFileDataWithUrl | undefined>;
  loadAndTryConvertEmbeddedFiles: (files: BinaryFilesWithOptionalUrl) => Promise<BinaryFilesWithUrl>;
  // Failure tracking and retry APIs (T029)
  getFailureState: () => FileFailureState;
  retryFailedDownloads: () => Promise<{ succeeded: number; failed: number }>;
  clearFailures: () => void;
  loading: {
    uploadingFile: boolean;
    downloadingFiles: boolean;
  };
}

const useWhiteboardFilesManager = ({
  storageBucketId,
  allowedMimeTypes,
  maxFileSize,
  allowFallbackToAttached,
  excalidrawAPI,
}: Props): WhiteboardFilesManager => {
  const guestSessionContext = useContext(GuestSessionContext);
  const guestName = guestSessionContext?.guestName;

  // State
  const [downloadingFiles, setDownloadingFiles] = useState(false);
  const [uploadFile, { loading: uploadingFile }] = useUploadFileMutation();

  // Store the latest uploadFile in a ref to avoid stale closure issues
  const uploadFileRef = useRef(uploadFile);
  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  // Store config in ref to avoid stale storageBucketId/allowFallbackToAttached/allowedMimeTypes/maxFileSize
  const configRef = useRef({ storageBucketId, allowFallbackToAttached, allowedMimeTypes, maxFileSize });
  useEffect(() => {
    configRef.current = { storageBucketId, allowFallbackToAttached, allowedMimeTypes, maxFileSize };
  }, [storageBucketId, allowFallbackToAttached, allowedMimeTypes, maxFileSize]);

  // Core services (created once, stable across renders)
  const cache = useRef(new WhiteboardFileCache()).current;
  const uploader = useRef(
    new FileUploader(
      () => configRef.current,
      variables => uploadFileRef.current({ variables })
    )
  ).current;
  const downloader = useRef(new FileDownloader()).current;
  const semaphore = useRef(new Semaphore(1)).current;

  // Force re-render when cache changes
  const [cacheVersion, setCacheVersion] = useState(0);
  useEffect(() => {
    return cache.subscribe(() => setCacheVersion(cache.getVersion()));
  }, [cache]);

  /**
   * Validate a file against storage bucket constraints before upload
   */
  const validateFile = (file: File): ImageValidationResult => {
    const { allowedMimeTypes: configuredMimeTypes, maxFileSize: configuredMaxSize } = configRef.current;
    return validateWhiteboardImageFile(file, {
      allowedMimeTypes: configuredMimeTypes,
      maxFileSizeBytes: configuredMaxSize,
    });
  };

  /**
   * Register a new file locally and return its ID (side-effect free: no network).
   * File is immediately usable via dataURL; upload happens via getUploadedFiles during sync.
   */
  const addNewFile = async (file: File): Promise<string> => {
    const fileData = await uploader.createFileData(file);
    cache.set(fileData.id, fileData);
    return fileData.id;
  };

  /**
   * Load files from a whiteboard: cache files with dataURL, download files with URL
   */
  const loadFiles = async (whiteboard: WhiteboardWithFiles | undefined): Promise<void> => {
    if (!whiteboard?.files) {
      return;
    }

    const files = Object.values(whiteboard.files);

    // Cache files that already have dataURL
    files
      .filter(file => file.dataURL)
      .forEach(file => {
        cache.set(file.id, file as BinaryFileDataWithOptionalUrl);
      });

    // Download files that only have URL
    const filesToDownload = files.filter(file => !file.dataURL && file.url && !cache.has(file.id));

    if (filesToDownload.length === 0) {
      return;
    }

    setDownloadingFiles(true);
    const { succeeded } = await downloader.downloadMultiple(filesToDownload, { guestName });
    succeeded.forEach(file => cache.set(file.id, file));
    setDownloadingFiles(false);
  };

  /**
   * Get all uploaded files from cache, uploading any missing ones.
   * Returns files with optional URL - files with only dataURL can still be broadcast
   * to peers who will receive the dataURL directly.
   */
  const getUploadedFiles = async (files: BinaryFiles): Promise<BinaryFilesWithOptionalUrl> => {
    if (!files) {
      return {};
    }

    const result: BinaryFilesWithOptionalUrl = {};
    const failedFileIds: string[] = [];

    for (const id of Object.keys(files)) {
      const cachedFile = cache.get(id);
      const url = cachedFile?.url;

      if (url) {
        // File already has URL - use it
        result[id] = { ...files[id], url } as BinaryFileDataWithUrl;
        continue;
      }

      // Attempt to upload and get URL
      const converted = await convertLocalFileToRemote(files[id]);
      if (converted) {
        result[id] = converted;
      } else {
        // Upload failed - fall back to including the file with its dataURL
        // This allows peers to receive the dataURL directly and still render the image
        const fileWithDataUrl = files[id];
        if (fileWithDataUrl.dataURL) {
          result[id] = { ...fileWithDataUrl } as BinaryFileDataWithOptionalUrl;
          failedFileIds.push(id);
        } else {
          // No URL and no dataURL - file is unrecoverable, skip it
          failedFileIds.push(id);
        }
      }
    }
    if (failedFileIds.length > 0) {
      error(
        `Failed to convert ${failedFileIds.length} of ${Object.keys(files).length} local files to remote (using dataURL fallback where available): [${failedFileIds.join(', ')}]`,
        { category: TagCategoryValues.WHITEBOARD, label: 'convert-to-remote-failures' }
      );
    }
    return result;
  };

  /**
   * Push cached files to Excalidraw
   */
  const pushFilesToExcalidraw = async () => {
    if (!excalidrawAPI) {
      return;
    }

    const filesAlreadyInExcalidraw = excalidrawAPI.getFiles();
    const filesToPush = cache.getAllArray().filter(fileInStore => {
      const fileInExcalidraw = filesAlreadyInExcalidraw[fileInStore.id];
      return !fileInExcalidraw || (!fileInExcalidraw.dataURL && fileInStore.dataURL);
    });

    if (filesToPush.length > 0) {
      excalidrawAPI.addFiles(filesToPush);
    }
  };

  /**
   * Convert local file (with dataURL) to remote file (with URL)
   */
  const convertLocalFileToRemote = (
    file: BinaryFileData & { url?: string }
  ): Promise<BinaryFileDataWithUrl | undefined> => {
    return semaphore.use(async () => {
      // File already has URL - preserve it along with dataURL if present
      if (file.url) {
        return { ...file } as BinaryFileDataWithUrl;
      }

      // Check if we have it cached with URL
      const cachedFile = cache.get(file.id);
      if (cachedFile?.url) {
        return { ...file, url: cachedFile.url } as BinaryFileDataWithUrl;
      }

      // Upload file if it has dataURL and we have storage
      if (file.dataURL && storageBucketId) {
        const fileObject = await dataUrlToFile(file.dataURL, '', file.mimeType, file.created);
        const { url } = await uploader.upload(fileObject);
        const result = { ...file, url } as BinaryFileDataWithUrl;
        cache.set(file.id, result);
        return result;
      }

      // Cannot convert
      error(
        `Cannot convert file to remote - missing required data: ${file.id} (hasUrl: ${!!file.url}, hasDataURL: ${!!file.dataURL}, hasStorageBucketId: ${!!storageBucketId}, inCache: ${cache.has(file.id)})`,
        { category: TagCategoryValues.WHITEBOARD, label: 'convert-missing-data' }
      );
      return undefined;
    });
  };

  /**
   * Convert all local files in a whiteboard to remote files.
   * Never drops files with valid retrieval paths (url or dataURL).
   * On upload failures, preserves dataURL so files can still be rendered.
   * Returns the whiteboard with preserved files and a list of any conversion failures.
   */
  const convertLocalFilesToRemoteInWhiteboard = async <W extends WhiteboardWithFiles>(
    whiteboard: W
  ): Promise<{ whiteboard: W; failedConversions: string[]; unrecoverableFiles: string[] }> => {
    if (!whiteboard?.files) {
      return { whiteboard, failedConversions: [], unrecoverableFiles: [] };
    }

    const { files, ...rest } = whiteboard;
    const filesNext: Record<string, BinaryFileDataWithUrl | BinaryFileData> = {};
    const failedConversions: string[] = []; // files that failed to get URL but have dataURL
    const unrecoverableFiles: string[] = []; // files with neither URL nor dataURL

    await Promise.all(
      Object.keys(files).map(async fileId => {
        const file = files[fileId];
        const normalizedFile = await convertLocalFileToRemote(file);

        if (normalizedFile) {
          // Successfully converted to remote
          filesNext[fileId] = normalizedFile;
        } else if (file.dataURL) {
          // Conversion failed but file has dataURL - preserve for rendering
          filesNext[fileId] = file;
          failedConversions.push(fileId);
          error(
            `File conversion failed but preserved with dataURL: ${fileId}`,
            { category: TagCategoryValues.WHITEBOARD, label: 'file-preserved-with-dataurl' }
          );
        } else if (file.url) {
          // File already has URL - preserve it
          filesNext[fileId] = file;
        } else {
          // No URL and no dataURL - file is unrecoverable
          unrecoverableFiles.push(fileId);
          error(
            `File has no retrieval path (no url, no dataURL) and will be dropped: ${fileId}`,
            { category: TagCategoryValues.WHITEBOARD, label: 'file-unrecoverable' }
          );
        }
      })
    );

    if (failedConversions.length > 0) {
      error(
        `${failedConversions.length} of ${Object.keys(files).length} files failed remote conversion but preserved with dataURL: [${failedConversions.join(', ')}]`,
        { category: TagCategoryValues.WHITEBOARD, label: 'files-conversion-partial' }
      );
    }

    if (unrecoverableFiles.length > 0) {
      error(
        `${unrecoverableFiles.length} of ${Object.keys(files).length} files dropped (unrecoverable): [${unrecoverableFiles.join(', ')}]`,
        { category: TagCategoryValues.WHITEBOARD, label: 'files-dropped-unrecoverable' }
      );
    }

    return {
      whiteboard: { files: filesNext, ...rest } as W,
      failedConversions,
      unrecoverableFiles,
    };
  };

  /**
   * Load embedded files and convert them to remote
   */
  const loadAndTryConvertEmbeddedFiles = async (files: BinaryFilesWithOptionalUrl): Promise<BinaryFilesWithUrl> => {
    const filesWithDataUrl = Object.values(files).filter(file => file.dataURL);

    if (filesWithDataUrl.length === 0) {
      return {};
    }

    excalidrawAPI?.addFiles(filesWithDataUrl);

    const { whiteboard: { files: uploadedFiles } } = await convertLocalFilesToRemoteInWhiteboard({ files });

    return Object.fromEntries(Object.entries(uploadedFiles ?? {}).filter(([_, file]) => file.url)) as BinaryFilesWithUrl;
  };

  /**
   * Get current failure state for uploads and downloads (T029)
   */
  const getFailureState = (): FileFailureState => {
    const uploadFailures = uploader.getFailedUploads();
    const downloadFailures = downloader.getFailedDownloads();
    return {
      uploadFailures,
      downloadFailures,
      hasFailures: uploadFailures.length > 0 || downloadFailures.length > 0,
    };
  };

  /**
   * Retry downloading files that previously failed (T029)
   */
  const retryFailedDownloads = async (): Promise<{ succeeded: number; failed: number }> => {
    const failedCount = downloader.getFailedDownloads().length;
    if (failedCount === 0) {
      return { succeeded: 0, failed: 0 };
    }

    const result = await downloader.retryFailed(fileId => cache.get(fileId), { guestName });
    result.succeeded.forEach(file => cache.set(file.id, file));

    // Log retry outcome for diagnostics (FR-007)
    if (result.succeeded.length > 0 || result.failed.length > 0) {
      error(
        `Whiteboard file download retry: ${result.succeeded.length}/${failedCount} recovered, ${result.failed.length} still failing`,
        {
          category: TagCategoryValues.WHITEBOARD,
          label: 'download-retry-outcome',
        }
      );
    }

    return { succeeded: result.succeeded.length, failed: result.failed.length };
  };

  /**
   * Clear all tracked failures (T029)
   */
  const clearFailures = (): void => {
    uploader.clearAllFailures();
    downloader.clearAllFailures();
  };

  return useMemo<WhiteboardFilesManager>(
    () => ({
      addNewFile,
      validateFile,
      loadFiles,
      getUploadedFiles,
      pushFilesToExcalidraw,
      convertLocalFileToRemote,
      convertLocalFilesToRemoteInWhiteboard,
      loadAndTryConvertEmbeddedFiles,
      getFailureState,
      retryFailedDownloads,
      clearFailures,
      loading: {
        uploadingFile,
        downloadingFiles,
      },
    }),
    [storageBucketId, excalidrawAPI, cacheVersion, downloadingFiles, uploadingFile, guestName]
  );
};

export default useWhiteboardFilesManager;
