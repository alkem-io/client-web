import { useState } from 'react';
import { useUploadFileMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { BinaryFileData, DataURL, ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';
import { excalidrawFileMimeType, generateIdFromFile } from './collab/utils';

const isValidDataURL = (url: string) => url.match(/^(data:)([\w/+-]*)(;charset=[\w-]+|;base64){0,1},(.*)/gi) !== null;

const dataUrlToFile = async (
  dataUrl: string,
  fileName: string = '',
  mimeType: string | undefined = undefined,
  lastModified: number = new Date().getTime()
): Promise<File> => {
  if (!isValidDataURL(dataUrl)) {
    return Promise.reject('Error');
  }
  const res = await fetch(dataUrl); // Not a real request, it's supposed to be a dataURL. // TODO: Study XSS attacks here
  const type = mimeType ?? dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
  const data = new Uint8Array(await res.arrayBuffer());
  const blob = new Blob([data], { type });
  return new File([blob], fileName, { type, lastModified });
};

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
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

type BinaryFileDataExtended = BinaryFileData & { url?: string };

interface Props {
  storageBucketId?: string; // FilesManagers without storageBucketId will throw an exception on file upload
  excalidrawApi: ExcalidrawAPIRefValue | null;
}

interface WhiteboardWithFiles {
  files?: Record<string, BinaryFileDataExtended>;
}
export interface WhiteboardFilesManager {
  addNewFile: (file: File) => Promise<string>;
  loadFiles: (data: WhiteboardWithFiles) => Promise<void>;
  importFilesToExcalidraw: () => Promise<void>;
  removeExcalidrawAttachments: <W extends WhiteboardWithFiles>(whiteboard: W) => Promise<W>;
  loading: {
    uploadingFile: boolean;
    downloadingFiles: boolean;
  };
  storageBucketId: string; //!!
}

const useWhiteboardFilesManager = ({ storageBucketId, excalidrawApi }: Props): WhiteboardFilesManager => {
  //!! Remove or mute
  const log = (...args) => {
    console.log('[FileManager]', ...args);
  };

  /**
   * Stores all the files temporarily:
   * - Files that come from loadFiles, downloaded when the wb json is loaded into excalidraw and the files are requested from their Urls
   * - Files that are added by the user to the wb when editing and are uploaded
   * - ... something for the realtime
   */
  const [fileStore, setFileStore] = useState<Record<string, BinaryFileDataExtended>>({});
  const fileStoreAddFile = (fileId: string, file: BinaryFileDataExtended) => {
    setFileStore(current => {
      log('changing fileStore from', current, ' to ', { ...current, [fileId]: file });
      return { ...current, [fileId]: file };
    });
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
    if (!storageBucketId) {
      throw new Error('Missing StorageBucket: Uploading images to this whiteboard is not supported');
    }

    const fileId = await generateIdFromFile(file);
    if (fileStore[fileId]) {
      log('file was already in our store', fileId, fileStore[fileId]);
      return fileId;
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
    const excalidraw = await excalidrawApi?.readyPromise;
    const fileFromExcalidraw = excalidraw?.getFiles()?.[fileId];
    if (fileFromExcalidraw) {
      fileStoreAddFile(fileId, {
        ...fileFromExcalidraw,
        url: data.uploadFileOnStorageBucket,
      });
    } else {
      fileStoreAddFile(fileId, {
        id: fileId,
        mimeType: excalidrawFileMimeType(file.type),
        created: Date.now(),
        url: data.uploadFileOnStorageBucket,
        dataURL: (await blobToDataURL(file)) as DataURL,
      });
    }

    return fileId;
  };

  /**
   * Receives a whiteboard object { elements, files ... },
   * analyzes the files object and downloads all the files that have a url and don't have a dataURL
   * once everything is downloaded the function importFilesToExcalidraw can be called
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
    const newFiles: typeof files = {};
    setDownloadingFiles(true);
    for (const fileId of pendingFileIds) {
      const file = whiteboard.files[fileId];
      if (file.url) {
        log('DOWNLOADING ', file);
        const dataURL = await fetchFileToDataURL(file.url);
        newFiles[fileId] = { ...file, dataURL } as BinaryFileDataExtended;
        fileStoreAddFile(fileId, newFiles[fileId]);
      } else {
        console.error('Cannot download', file);
      }
    }
    setDownloadingFiles(false);
  };

  /**
   * Injects into Excalidraw all the files in our fileStore.
   * Excalidraw will filter later if any of those files was deleted.
   * @returns
   */
  const importFilesToExcalidraw = async () => {
    const excalidraw = await excalidrawApi?.readyPromise;
    if (!excalidraw) {
      log('excalidrawApi not ready yet or no files', excalidraw, fileStore);
      return;
    }

    const filesAsArray = Object.keys(fileStore).map(fileId => fileStore[fileId]);
    excalidraw.addFiles(filesAsArray);
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
  const removeExcalidrawAttachments = async <W extends WhiteboardWithFiles>(whiteboard: W): Promise<W> => {
    if (!whiteboard?.files) {
      log('no whiteboard or no files', whiteboard);
      return whiteboard;
    }
    const { files, ...rest } = whiteboard;
    const filesNext: Record<string, BinaryFileDataExtended> = {};

    for (const fileId of Object.keys(files)) {
      const file = files[fileId] as BinaryFileDataExtended;
      if (file.url) {
        // The url was already set, just copy it and remove dataURL to the output:
        filesNext[fileId] = { ...file, dataURL: '' } as BinaryFileDataExtended;
      } else if (fileStore[fileId]) {
        // The file is in the fileStore, so it has been uploaded at some point, take the url from there:
        filesNext[fileId] = { ...file, dataURL: '', url: fileStore[fileId].url } as BinaryFileDataExtended;
      } else if (file.dataURL) {
        log('NEED TO UPLOAD ', fileId, file);
        const fileObject = await dataUrlToFile(file.dataURL, '', file.mimeType, file.created);
        const id = await addNewFile(fileObject);
        log('Uploaded ', fileId, file, id);
        filesNext[fileId] = { ...file, url: fileStore[fileId].url, dataURL: '' } as BinaryFileDataExtended;
      } else {
        console.error('File without url or dataURL. IGNORED', file);
      }
    }
    return { files: filesNext, ...rest } as W;
  };

  return {
    addNewFile,
    loadFiles, // Load external files into Excalidraw
    importFilesToExcalidraw,
    removeExcalidrawAttachments,
    loading: {
      uploadingFile,
      downloadingFiles,
    },
    storageBucketId: storageBucketId ?? 'Undefined!!', //!!
  };
};

export default useWhiteboardFilesManager;
