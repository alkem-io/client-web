import type {
  ExcalidrawElement,
  ExcalidrawImageElement,
  InitializedExcalidrawImageElement,
} from '@alkemio/excalidraw/dist/types/excalidraw/element/types';
import type { FileId } from '@alkemio/excalidraw/dist/types/excalidraw/element/types';
import { unstable_batchedUpdates } from 'react-dom';

///// This is copied from Excalidraw sources because VITE cannot import certain things from the package,
///// even though VSCode seems to have no problem to see them and shows no compilation error
// TODO: import them properly

export const arrayToMapWithIndex = <T extends { id: string }>(elements: readonly T[]) =>
  elements.reduce((acc, element: T, idx) => {
    acc.set(element.id, [element, idx]);
    return acc;
  }, new Map<string, [element: T, index: number]>());

export const bytesToHexString = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map(byte => `0${byte.toString(16)}`.slice(-2))
    .join('');
};

export type ResolvablePromise<T> = Promise<T> & {
  resolve: [T] extends [undefined] ? (value?: T) => void : (value: T) => void;
  reject: (error: Error) => void;
};

/**
 * @param func handler taking at most single parameter (event).
 */
export const withBatchedUpdates = <TFunction extends ((event) => void) | (() => void)>(
  func: Parameters<TFunction>['length'] extends 0 | 1 ? TFunction : never
) =>
  (event => {
    unstable_batchedUpdates(func as TFunction, event);
  }) as TFunction;

export const isImageElement = (element: ExcalidrawElement | null): element is ExcalidrawImageElement => {
  return !!element && element.type === 'image';
};

export const isInitializedImageElement = (
  element: ExcalidrawElement | null
): element is InitializedExcalidrawImageElement => {
  return !!element && element.type === 'image' && !!element.fileId;
};

export enum UserIdleState {
  ACTIVE = 'active',
  AWAY = 'away',
  IDLE = 'idle',
}

type IMAGE_MIME_TYPES =
  | 'image/svg+xml'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/bmp'
  | 'image/x-icon'
  | 'image/avif'
  | 'image/jfif';

function isImageMimeType(value: string): value is IMAGE_MIME_TYPES {
  return [
    'image/svg+xml',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/x-icon',
    'image/avif',
    'image/jfif',
  ].includes(value);
}

export const excalidrawFileMimeType = (type: string): IMAGE_MIME_TYPES | 'application/octet-stream' =>
  isImageMimeType(type) ? type : 'application/octet-stream';

export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if ('arrayBuffer' in blob) {
    return blob.arrayBuffer();
  }
  // Safari
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't convert blob to ArrayBuffer"));
      }
      resolve(event.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

/** generates SHA-1 digest from supplied file */
export const generateIdFromFile = async (file: File): Promise<FileId> => {
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', await blobToArrayBuffer(file));
  return bytesToHexString(new Uint8Array(hashBuffer)) as FileId;
};
