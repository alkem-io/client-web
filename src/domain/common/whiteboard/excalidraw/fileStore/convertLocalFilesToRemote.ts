import type { BinaryFileData } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { BinaryFileDataWithUrl, WhiteboardWithFiles } from '../types';

export interface ConversionResult<W> {
  whiteboard: W;
  failedConversions: string[];
  unrecoverableFiles: string[];
}

export interface FileConverter {
  (file: BinaryFileData & { url?: string }): Promise<BinaryFileDataWithUrl | undefined>;
}

export interface ConversionLogger {
  onFilePreservedWithDataUrl?: (fileId: string) => void;
  onFileUnrecoverable?: (fileId: string) => void;
  onConversionPartial?: (failedCount: number, totalCount: number, failedIds: string[]) => void;
  onFilesDropped?: (droppedCount: number, totalCount: number, droppedIds: string[]) => void;
}

/**
 * Convert all local files in a whiteboard to remote files.
 *
 * Guarantees (T022 spec):
 * - Never drops files with valid retrieval paths (url or dataURL)
 * - On upload failures, preserves dataURL so files can still be rendered
 * - Only drops files that have no retrieval path (no url, no dataURL)
 * - Returns structured info about failures for caller to surface
 *
 * @param whiteboard The whiteboard containing files to convert
 * @param convertFile Function to convert a single file to remote
 * @param logger Optional callbacks for logging events
 * @returns The whiteboard with preserved files and lists of any conversion failures
 */
export async function convertLocalFilesToRemoteInWhiteboard<W extends WhiteboardWithFiles>(
  whiteboard: W,
  convertFile: FileConverter,
  logger?: ConversionLogger
): Promise<ConversionResult<W>> {
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
      const normalizedFile = await convertFile(file);

      if (normalizedFile) {
        // Successfully converted to remote
        filesNext[fileId] = normalizedFile;
      } else if (file.dataURL) {
        // Conversion failed but file has dataURL - preserve for rendering
        filesNext[fileId] = file;
        failedConversions.push(fileId);
        logger?.onFilePreservedWithDataUrl?.(fileId);
      } else if (file.url) {
        // File already has URL - preserve it
        filesNext[fileId] = file;
      } else {
        // No URL and no dataURL - file is unrecoverable
        unrecoverableFiles.push(fileId);
        logger?.onFileUnrecoverable?.(fileId);
      }
    })
  );

  if (failedConversions.length > 0) {
    logger?.onConversionPartial?.(failedConversions.length, Object.keys(files).length, failedConversions);
  }

  if (unrecoverableFiles.length > 0) {
    logger?.onFilesDropped?.(unrecoverableFiles.length, Object.keys(files).length, unrecoverableFiles);
  }

  return {
    whiteboard: { files: filesNext, ...rest } as W,
    failedConversions,
    unrecoverableFiles,
  };
}
