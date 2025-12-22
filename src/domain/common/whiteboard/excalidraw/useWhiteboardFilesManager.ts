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
import { FileUploader } from './fileStore/FileUploader';
import { FileDownloader } from './fileStore/FileDownloader';
import type {
  BinaryFileDataWithUrl,
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
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  allowFallbackToAttached?: boolean;
}

export interface WhiteboardFilesManager {
  addNewFile: (file: File) => Promise<string>;
  loadFiles: (data: WhiteboardWithFiles) => Promise<void>;
  getUploadedFiles: (filesInExcalidraw: BinaryFiles) => Promise<BinaryFilesWithUrl>;
  pushFilesToExcalidraw: () => Promise<void>;
  convertLocalFilesToRemoteInWhiteboard: <W extends WhiteboardWithFiles>(whiteboard: W) => Promise<W>;
  convertLocalFileToRemote: (file: BinaryFileData & { url?: string }) => Promise<BinaryFileDataWithUrl | undefined>;
  loadAndTryConvertEmbeddedFiles: (files: BinaryFilesWithOptionalUrl) => Promise<BinaryFilesWithUrl>;
  loading: {
    uploadingFile: boolean;
    downloadingFiles: boolean;
  };
}

const useWhiteboardFilesManager = ({
  storageBucketId,
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

  // Core services (created once, stable across renders)
  const cache = useRef(new WhiteboardFileCache()).current;
  const uploader = useRef(
    new FileUploader({ storageBucketId, allowFallbackToAttached }, variables => uploadFileRef.current({ variables }))
  ).current;
  const downloader = useRef(new FileDownloader()).current;
  const semaphore = useRef(new Semaphore(1)).current;

  // Force re-render when cache changes
  const [cacheVersion, setCacheVersion] = useState(0);
  useEffect(() => {
    return cache.subscribe(() => setCacheVersion(cache.getVersion()));
  }, [cache]);

  /**
   * Upload a new file and return its ID
   */
  const addNewFile = async (file: File): Promise<string> => {
    const fileData = await uploader.uploadAndCreateFileData(file);
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
        const fileWithOptionalUrl = file as BinaryFileData & { url?: string };
        const url = fileWithOptionalUrl.url || '';
        cache.set(file.id, { ...file, url } as BinaryFileDataWithUrl);
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
   * Get all uploaded files from cache, uploading any missing ones
   */
  const getUploadedFiles = async (files: BinaryFiles): Promise<BinaryFilesWithUrl> => {
    if (!files) {
      return {};
    }

    const result: BinaryFilesWithUrl = {};
    const failedFileIds: string[] = [];

    for (const id of Object.keys(files)) {
      const cachedFile = cache.get(id);
      if (cachedFile) {
        result[id] = cachedFile;
      } else {
        const converted = await convertLocalFileToRemote(files[id]);
        if (converted) {
          result[id] = converted;
        } else {
          failedFileIds.push(id);
        }
      }
    }

    if (failedFileIds.length > 0) {
      error(
        `Failed to convert ${failedFileIds.length} of ${Object.keys(files).length} local files to remote: [${failedFileIds.join(', ')}]`,
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
   * Convert all local files in a whiteboard to remote files
   */
  const convertLocalFilesToRemoteInWhiteboard = async <W extends WhiteboardWithFiles>(whiteboard: W): Promise<W> => {
    if (!whiteboard?.files) {
      return whiteboard;
    }

    const { files, ...rest } = whiteboard;
    const filesNext: Record<string, BinaryFileDataWithUrl | BinaryFileData> = {};
    const failedConversions: string[] = [];

    await Promise.all(
      Object.keys(files).map(async fileId => {
        const file = files[fileId];
        const normalizedFile = await convertLocalFileToRemote(file);

        if (normalizedFile) {
          filesNext[fileId] = normalizedFile;
        } else if (allowFallbackToAttached) {
          filesNext[fileId] = file;
        } else {
          failedConversions.push(fileId);
          error(
            `File conversion failed and will be dropped: ${fileId} (hasUrl: ${!!file.url}, hasDataURL: ${!!file.dataURL}, storageBucketId: ${storageBucketId})`,
            { category: TagCategoryValues.WHITEBOARD, label: 'file-dropped-no-fallback' }
          );
        }
      })
    );

    if (failedConversions.length > 0) {
      error(
        `${failedConversions.length} of ${Object.keys(files).length} files dropped during conversion - whiteboard may lose files: [${failedConversions.join(', ')}]`,
        { category: TagCategoryValues.WHITEBOARD, label: 'files-dropped-batch' }
      );
    }

    return { files: filesNext, ...rest } as W;
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

    const { files: uploadedFiles } = await convertLocalFilesToRemoteInWhiteboard({ files });

    return Object.fromEntries(Object.entries(uploadedFiles).filter(([_, file]) => file.url)) as BinaryFilesWithUrl;
  };

  return useMemo<WhiteboardFilesManager>(
    () => ({
      addNewFile,
      loadFiles,
      getUploadedFiles,
      pushFilesToExcalidraw,
      convertLocalFileToRemote,
      convertLocalFilesToRemoteInWhiteboard,
      loadAndTryConvertEmbeddedFiles,
      loading: {
        uploadingFile,
        downloadingFiles,
      },
    }),
    [storageBucketId, excalidrawAPI, cacheVersion, downloadingFiles, uploadingFile, guestName]
  );
};

export default useWhiteboardFilesManager;
