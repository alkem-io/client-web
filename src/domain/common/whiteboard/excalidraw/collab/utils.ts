import type {
  ExcalidrawElement,
  ExcalidrawImageElement,
  FileId,
} from '@alkemio/excalidraw/dist/types/element/src/types';

///// This is copied from Excalidraw sources because VITE cannot import certain things from the package,
///// even though VSCode seems to have no problem to see them and shows no compilation error
// TODO: import them properly

export const bytesToHexString = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map(byte => `0${byte.toString(16)}`.slice(-2))
    .join('');
};

export const isImageElement = (element: ExcalidrawElement | null): element is ExcalidrawImageElement => {
  return !!element && element.type === 'image';
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

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
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
