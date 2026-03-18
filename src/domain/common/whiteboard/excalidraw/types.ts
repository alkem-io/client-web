import type { BinaryFileData } from '@alkemio/excalidraw/dist/types/excalidraw/types';

export type BinaryFileDataWithOptionalUrl = BinaryFileData & { url?: string };
export type BinaryFileDataWithUrl = BinaryFileData & { url: string };
export type BinaryFilesWithUrl = Record<string, BinaryFileDataWithUrl>;
export type BinaryFilesWithOptionalUrl = Record<string, BinaryFileDataWithOptionalUrl>;

export interface WhiteboardWithFiles {
  files?: Record<string, BinaryFileDataWithOptionalUrl>;
}
