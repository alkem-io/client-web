import { useMemo, useRef, useState } from 'react';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import type {
  BinaryFileData,
  BinaryFiles,
  DataURL,
  ExcalidrawImperativeAPI,
} from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { excalidrawFileMimeType, generateIdFromFile } from './collab/utils';
import Semaphore from 'ts-semaphore';
import { error } from '@/core/logging/sentry/log';

export type BinaryFileDataWithUrl = BinaryFileData & { url: string };
export type BinaryFileDataWithOptionalUrl = BinaryFileData & { url?: string };
export type BinaryFilesWithUrl = Record<string, BinaryFileDataWithUrl>;
export type BinaryFilesWithOptionalUrl = Record<string, BinaryFileDataWithOptionalUrl>;

const guestName = globalThis.sessionStorage.getItem('alkemio_guest_name');

const isValidDataURL = (url: string) =>
  url.match(/^(data:)([\w/+-]*)(;charset=[\w-]+|;base64){0,1},[A-Za-z0-9+/=]+$/gi) !== null;

const dataUrlToFile = async (
  dataUrl: string,
  fileName: string = 'from data',
  mimeType: string | undefined = undefined,
  lastModified: number = new Date().getTime()
): Promise<File> => {
  if (!isValidDataURL(dataUrl)) {
    return Promise.reject('Not a valid dataURL detected');
  }

  const mime = dataUrl.split(',')?.[0]?.match(/:(.*?);/)?.[1];
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], fileName, { type: mime ?? mimeType ?? 'application/octet-stream', lastModified });
};

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
};

const fetchFileToDataURL = async (url: string): Promise<string> => {
  const headers = {};
  if (guestName) {
    Object.assign(headers, { 'x-guest-name': guestName });
  }
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${url}`);
  }

  const blob = await response.blob();
  return blobToDataURL(blob);
};

interface Props {
  storageBucketId?: string; // FilesManagers without storageBucketId will throw an exception on file upload
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  // TODO remove when all whiteboards are known to have a storageBucketId
  allowFallbackToAttached?: boolean;
}

interface WhiteboardWithFiles {
  files?: Record<string, BinaryFileDataWithOptionalUrl>;
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
  const log = (..._args) => {
    // TODO: Remove those `log()`s when this is confirmed to be fully stable
    //console.log('[FileManager]', ..._args);
  };

  /**
   * Stores all the files temporarily:
   * - Files that come from loadFiles, downloaded when the wb json is loaded into excalidraw and the files are requested from their Urls
   * - Files that are added by the user to the wb when editing and are uploaded
   */
  const fileStore = useRef<Record<string, BinaryFileDataWithUrl>>({});
  const [fileStoreVersion, setFileStoreVersion] = useState<number>(0); // This is used to force a re-render when the fileStore changes

  log('[render]', {
    filesCount: Object.keys(fileStore.current).length,
    fileStore: fileStore.current,
    params: { storageBucketId, allowFallbackToAttached, excalidrawAPI },
  });

  const fileStoreAddFile = (fileId: string, file: BinaryFileDataWithUrl) => {
    log('changing fileStore version from', fileStore.current, ' to ', {
      ...fileStore.current,
      [fileId]: file,
    });

    fileStore.current = { ...fileStore.current, [fileId]: file };
    setFileStoreVersion(fileStoreVersion => fileStoreVersion + 1);
  };

  const [downloadingFiles, setDownloadingFiles] = useState(false);
  const [uploadFile, { loading: uploadingFile }] = useUploadFileMutation();

  /**
   * Generates the fileId using the Excalidraw's internal function (the SHA-1 of the content).
   * Uploads the file to the storageBucket
   * Stores the file with the storageBucket url in fileStore.
   * @param file: File
   * @returns FileId
   */
  const addNewFile = async (file: File): Promise<string> => {
    return (await uploadFileToStorage(file)).id;
  };

  const uploadFileToStorage = async (file: File): Promise<{ id: string; url: string }> => {
    const fileId = await generateIdFromFile(file);

    if (fileStore.current[fileId]) {
      log('file was already in our store', fileId, fileStore.current[fileId]);
      return { id: fileId, url: fileStore.current[fileId].url };
    }

    if (!storageBucketId) {
      if (allowFallbackToAttached) {
        return { id: fileId, url: '' };
      } else {
        throw new Error('Missing StorageBucket: Uploading images to this whiteboard is not supported');
      }
    }

    log('uploading new file', fileId, file);
    const { data, errors } = await uploadFile({
      variables: {
        file,
        uploadData: {
          storageBucketId,
        },
      },
    });

    if (!data?.uploadFileOnStorageBucket || errors) {
      log('Error uploading!', data, errors);
      return Promise.reject(errors?.[0]?.message);
    }

    log('newFile uploaded', fileId, data.uploadFileOnStorageBucket);

    const fileFromExcalidraw = excalidrawAPI?.getFiles()?.[fileId];
    const url = data.uploadFileOnStorageBucket;

    if (fileFromExcalidraw) {
      fileStoreAddFile(fileId, {
        ...fileFromExcalidraw,
        url,
      });
    } else {
      fileStoreAddFile(fileId, {
        id: fileId,
        mimeType: excalidrawFileMimeType(file.type),
        created: Date.now(),
        url,
        dataURL: (await blobToDataURL(file)) as DataURL,
      });
    }

    return { id: fileId, url };
  };

  /**
   * Receives a whiteboard object { elements, files ... },
   * analyzes the files object and downloads all the files that have a url and don't have a dataURL
   * once everything is downloaded the function pushFilesToExcalidraw can be called
   * @param whiteboard
   * @returns
   */
  const loadFiles = async (whiteboard: WhiteboardWithFiles | undefined): Promise<void> => {
    if (!whiteboard?.files) {
      log('No files to download');
      return;
    }

    const files = whiteboard.files;
    // leave only the incoming files that HAVE a dataURL and add them to the local scene
    // we don't need to download these
    Object.values(files)
      .filter<BinaryFileData>((file): file is BinaryFileData => !!file.dataURL)
      .forEach(file => fileStoreAddFile(file.id, { ...file, url: '' } as BinaryFileDataWithUrl));
    // leave only the incoming files that don't have a dataURL but have URL and are not in the fileStore
    const downloadableFileIds = Object.keys(files).filter(
      fileId => !files[fileId]?.dataURL && !fileStore.current[fileId]
    );

    if (!downloadableFileIds.length) {
      return;
    }

    log('I need to download these files', downloadableFileIds);

    setDownloadingFiles(true);

    await Promise.allSettled(
      downloadableFileIds.map(async fileId => {
        if (fileStore.current[fileId]?.dataURL) {
          log(`No need to download ${fileId} already in the store`, fileStore.current[fileId]);
          return;
        }
        const file = whiteboard!.files![fileId];
        if (!file.url) {
          error(`Cannot download: ${file.id}`, { label: 'whiteboard-file-manager' });
          throw new Error(`Cannot download: ${file.id}`);
        }

        log('DOWNLOADING ', file);
        try {
          const dataURL = await fetchFileToDataURL(file.url);
          // try-catch will avoid putting the file in the store if fetching fails
          fileStoreAddFile(fileId, { ...file, dataURL } as BinaryFileDataWithUrl);
        } catch (e) {
          error(`Error downloading file: ${file.url}`, { label: 'whiteboard-file-manager' });
          throw e;
        }
      })
    );

    setDownloadingFiles(false);
  };

  /**
   * Returns all the files uploaded to the fileStore.
   * Argument `files` should be the files that are currently in the whiteboard, can be obtained from Excalidraw's API.
   * if any of the passed files is not in the fileStore, it will be uploaded to the storageBucket.
   *
   * @returns {BinaryFilesWithUrl} - The files with their URLs in the storage bucket.
   * Property `dataURL` can contain the base64 data of the file if it was coming in the parameter `files`.
   */
  const getUploadedFiles = async (files: BinaryFiles): Promise<BinaryFilesWithUrl> => {
    const result: BinaryFilesWithUrl = {};
    if (!files) {
      return result;
    }
    for (const id of Object.keys(files)) {
      if (fileStore.current[id]) {
        result[id] = fileStore.current[id];
      } else {
        const file = await convertLocalFileToRemote(files[id]);
        if (file) {
          result[id] = file;
        }
      }
    }
    return result;
  };

  /**
   * Injects into Excalidraw all the files in our fileStore.
   * Excalidraw will filter later if any of those files was deleted.
   * @returns
   */
  const pushFilesToExcalidraw = async () => {
    if (!excalidrawAPI) {
      log('excalidrawAPI not ready yet or no files', excalidrawAPI, fileStore.current);
      return;
    }
    const filesAlreadyInExcalidraw = excalidrawAPI.getFiles();
    const filesAsArray = Object.keys(fileStore.current)
      .filter(fileId => !filesAlreadyInExcalidraw[fileId]?.dataURL) // filter out all the files that are already loaded in Excalidraw
      .map(fileId => fileStore.current[fileId]);

    if (filesAsArray.length > 0) {
      log('pushing files to Excalidraw from FilesManager', fileStore.current, filesAsArray);
      excalidrawAPI.addFiles(filesAsArray);
    }
  };

  /**
   * Receives a Whiteboard, { elements, files ... }
   * Returns the same but a modified version of files removing all the dataURLs.
   *
   * Uploads the files to the storage bucket if they are not yet uploaded.
   *
   * @param whiteboard
   * @returns
   */
  const convertLocalFilesToRemoteInWhiteboard = async <W extends WhiteboardWithFiles>(whiteboard: W): Promise<W> => {
    if (!whiteboard?.files) {
      log('no whiteboard or no files', whiteboard);
      return whiteboard;
    }

    const { files, ...rest } = whiteboard;
    const filesNext: Record<string, BinaryFileDataWithUrl | BinaryFileData> = {};

    await Promise.all(
      Object.keys(files).map(async fileId => {
        const file = files[fileId];
        const normalizedFile = await convertLocalFileToRemote(file);
        if (normalizedFile) {
          filesNext[fileId] = normalizedFile;
        } else if (allowFallbackToAttached) {
          // TODO remove when all whiteboards are known to have a storageBucketId
          filesNext[fileId] = file;
        }
      })
    );

    return { files: filesNext, ...rest } as W;
  };

  const semaphore = useRef(new Semaphore(1)).current;

  /**
   * Finds a file in the fileStore and prepares it to be sent:
   * - Ensures that it has a URL
   * - Removes dataURL
   *
   * A Semaphore is required in this function because it can be called multiple times in parallel by Collab.syncFiles
   * Multiple upload requests were triggered because those `await uploadFileToStorage` were taking longer
   * than the next call to this function from syncFiles.
   * The semaphore ensures that the second call to this function will wait for the upload to finish
   * and then the first condition will evaluate to `true` because the file will be already in the fileStore.
   */
  const convertLocalFileToRemote = (
    file: BinaryFileData & { url?: string }
  ): Promise<BinaryFileDataWithUrl | undefined> => {
    return semaphore.use(async () => {
      if (file.url) {
        return { ...file, dataURL: '' } as BinaryFileDataWithUrl;
      }
      // the file might be in the store, but does it have a URL to return?
      if (fileStore.current[file.id]?.url) {
        // The file is in the fileStore, so it has been uploaded at some point, take the url from there:
        return { ...file, dataURL: '', url: fileStore.current[file.id].url } as BinaryFileDataWithUrl;
      }
      // it doesn't matter if the file is in the store, but can we upload it`s content?
      else if (file.dataURL && storageBucketId) {
        log('NEED TO UPLOAD ', file.id, file);
        const fileObject = await dataUrlToFile(file.dataURL, '', file.mimeType, file.created);
        // In theory id should be equal to fileId, but Excalidraw modifies files after it loads them in memory, so hashes don't have to necessarily match anymore
        const { id, url } = await uploadFileToStorage(fileObject);
        log('Uploaded ', file.id, file, fileObject, id, url);
        return { ...file, url, dataURL: '' } as BinaryFileDataWithUrl;
      }
    });
  };

  /**
   * Receives a mixed list of files with dataURL or URL. Loads only the files with dataURLs and tries to convert them to URLs.
   * Returns only the converted files.
   * @param files
   */
  const loadAndTryConvertEmbeddedFiles = async (files: BinaryFilesWithOptionalUrl): Promise<BinaryFilesWithUrl> => {
    // extract only files with dataURL
    const filesWithDataUrl = { ...files };
    Object.values(filesWithDataUrl).forEach(file => {
      if (!file.dataURL) {
        delete filesWithDataUrl[file.id];
      }
    });

    const filesWithDataUrlArray = Object.values(filesWithDataUrl);

    if (!filesWithDataUrlArray.length) {
      return {};
    }

    // adds files with dataURL
    excalidrawAPI?.addFiles(filesWithDataUrlArray);
    // converts files from dataURL to URL
    const { files: uploadedFilesWithOptionalUrl } = await convertLocalFilesToRemoteInWhiteboard({
      files: filesWithDataUrl,
    });

    // leave only the successfully converted files
    return Object.fromEntries(
      // filter out files that were not converted
      Object.entries(uploadedFilesWithOptionalUrl).filter(([_, file]) => file.url)
    ) as BinaryFilesWithUrl;
  };

  return useMemo<WhiteboardFilesManager>(
    () => ({
      addNewFile,
      loadFiles, // Load external files into Excalidraw
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
    [storageBucketId, excalidrawAPI, fileStore.current, fileStoreVersion, downloadingFiles, uploadingFile]
  );
};

export default useWhiteboardFilesManager;
