import { useMemo, useRef, useState } from 'react';
import { useUploadFileMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { BinaryFileData, DataURL, ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import { excalidrawFileMimeType, generateIdFromFile } from './collab/utils';
import Semaphore from 'ts-semaphore';

const semaphore = new Semaphore(1);

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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${url}`);
  }

  const blob = await response.blob();
  return blobToDataURL(blob);
};

export type BinaryFileDataWithUrl = BinaryFileData & { url: string };
export type BinaryFileDataWithOptionalUrl = BinaryFileData & { url?: string };

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
  pushFilesToExcalidraw: () => Promise<void>;
  convertLocalFilesToRemoteInWhiteboard: <W extends WhiteboardWithFiles>(whiteboard: W) => Promise<W>;
  convertLocalFileToRemote: (file: BinaryFileData & { url?: string }) => Promise<BinaryFileDataWithUrl | undefined>;
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

    const pendingFileIds = Object.keys(files).filter(fileId => !files[fileId]?.dataURL);
    log('I need to download these files', pendingFileIds);
    const newFiles: Record<string, BinaryFileDataWithUrl> = {};

    setDownloadingFiles(true);

    try {
      await Promise.all(
        pendingFileIds.map(async fileId => {
          const file = whiteboard!.files![fileId];
          if (fileStore.current[fileId]?.dataURL) {
            log(`No need to download ${fileId} already in the store`, fileStore.current[fileId]);
            return;
          }
          if (file.url) {
            log('DOWNLOADING ', file);
            const dataURL = await fetchFileToDataURL(file.url);
            newFiles[fileId] = { ...file, dataURL } as BinaryFileDataWithUrl;
            fileStoreAddFile(fileId, newFiles[fileId]);
          } else {
            console.error('Cannot download', file);
          }
        })
      );
    } finally {
      setDownloadingFiles(false);
    }
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

  /**
   * Finds a file in the fileStore and prepares it to be sent:
   * - Ensures that it has a url
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
      if (fileStore.current[file.id]) {
        // The file is in the fileStore, so it has been uploaded at some point, take the url from there:
        return { ...file, dataURL: '', url: fileStore.current[file.id].url } as BinaryFileDataWithUrl;
      } else if (file.dataURL && storageBucketId) {
        log('NEED TO UPLOAD ', file.id, file);
        const fileObject = await dataUrlToFile(file.dataURL, '', file.mimeType, file.created);
        // In theory id should be equal to fileId, but Excalidraw modifies files after it loads them in memory, so hashes don't have to necessarily match anymore
        const { id, url } = await uploadFileToStorage(fileObject);
        log('Uploaded ', file.id, file, fileObject, id, url);
        return { ...file, url, dataURL: '' } as BinaryFileDataWithUrl;
      }
    });
  };

  return useMemo<WhiteboardFilesManager>(
    () => ({
      addNewFile,
      loadFiles, // Load external files into Excalidraw
      pushFilesToExcalidraw,
      convertLocalFileToRemote,
      convertLocalFilesToRemoteInWhiteboard,
      loading: {
        uploadingFile,
        downloadingFiles,
      },
    }),
    [storageBucketId, excalidrawAPI, fileStore.current, fileStoreVersion, downloadingFiles, uploadingFile]
  );
};

export default useWhiteboardFilesManager;
