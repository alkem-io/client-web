import type { BinaryFileDataWithOptionalUrl } from '../types';

export const isUsableUrl = (url: string | undefined | null): url is string => {
  return typeof url === 'string' && url.trim().length > 0;
};

export const isUsableDataUrl = (dataUrl: string | undefined | null): dataUrl is string => {
  return typeof dataUrl === 'string' && dataUrl.trim().length > 0;
};

export const isFileRenderable = (file: Pick<BinaryFileDataWithOptionalUrl, 'url' | 'dataURL'>): boolean => {
  return isUsableUrl(file.url) || isUsableDataUrl(file.dataURL);
};

export const shouldStripDataUrlForBroadcast = (file: Pick<BinaryFileDataWithOptionalUrl, 'url'>): boolean => {
  return isUsableUrl(file.url);
};
