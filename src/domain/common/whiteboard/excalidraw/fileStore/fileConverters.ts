import type { DataURL } from '@alkemio/excalidraw/dist/types/excalidraw/types';

/**
 * Utilities for converting between dataURLs, Blobs, and Files.
 * Pure functions with no side effects.
 */

export const isValidDataURL = (url: string): boolean =>
  url.match(/^(data:)([\w/+-]*)(;charset=[\w-]+|;base64){0,1},[A-Za-z0-9+/=]+$/gi) !== null;

export const dataUrlToFile = async (
  dataUrl: string,
  fileName: string = 'from data',
  mimeType: string | undefined = undefined,
  lastModified: number = new Date().getTime()
): Promise<File> => {
  if (!isValidDataURL(dataUrl)) {
    throw new Error('Not a valid dataURL detected');
  }

  const mime = dataUrl.split(',')?.[0]?.match(/:(.*?);/)?.[1];
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], fileName, { type: mime ?? mimeType ?? 'application/octet-stream', lastModified });
};

export const blobToDataURL = (blob: Blob): Promise<DataURL> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as DataURL);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
};

export const fetchFileToDataURL = async (url: string, headers?: Record<string, string>): Promise<DataURL> => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${url}`);
  }

  const blob = await response.blob();
  return blobToDataURL(blob);
};
