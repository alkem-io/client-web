import { useEffect, useRef, useState } from 'react';
import {
  acceptsFile,
  FileUploadRejection,
  type LeftOutFile,
  MAX_CONCURRENT_UPLOADS,
  type RowFileUpload,
  selectFiles,
} from '@/crd/lib/fileSelection';

type UploadTask = {
  key: string;
  file: File;
  upload: RowFileUpload;
  place: (file: File, url: string) => void;
  token: number;
};

type RowKey = string | number;

/**
 * Owns every upload of a row-list surface. A one-file pick (`uploadOne`) runs at once with the
 * host's own failure handling and reserves its row until it settles, so `isReserved` tells batch
 * placement to append instead of filling that row. Multi-file selections made on any row join
 * one queue, and at most `MAX_CONCURRENT_UPLOADS` run at a time. `cancel()` and unmount stop
 * queued files from starting and make late batch results write nothing; a cancelled upload
 * still holds its slot until it settles.
 */
export function useRowFileUploads(onFileUpload: RowFileUpload | undefined, accept: string | undefined) {
  const [pending, setPending] = useState<{ key: string; name: string }[]>([]);
  const [leftOut, setLeftOut] = useState<LeftOutFile[]>([]);
  const [uploadingRows, setUploadingRows] = useState<RowKey[]>([]);
  const reservedRows = useRef(new Set<RowKey>());
  const queue = useRef<UploadTask[]>([]);
  const active = useRef(0);
  const token = useRef(0);
  const nextKey = useRef(0);

  useEffect(
    () => () => {
      token.current += 1;
      queue.current = [];
    },
    []
  );

  const run = async (task: UploadTask) => {
    const isCurrent = () => task.token === token.current;
    try {
      const url = await task.upload(task.file, { silent: true });
      if (!url) throw new FileUploadRejection({ kind: 'failed' });
      if (isCurrent()) task.place(task.file, url);
    } catch (error) {
      if (isCurrent()) {
        const reason = error instanceof FileUploadRejection ? error.reason : { kind: 'failed' as const };
        setLeftOut(prev => [...prev, { name: task.file.name, reason }]);
      }
    } finally {
      if (isCurrent()) setPending(prev => prev.filter(item => item.key !== task.key));
      active.current -= 1;
      pump();
    }
  };

  const pump = () => {
    while (active.current < MAX_CONCURRENT_UPLOADS) {
      const task = queue.current.shift();
      if (!task) return;
      active.current += 1;
      void run(task);
    }
  };

  const uploadMany = (files: File[], place: (file: File, url: string) => void) => {
    if (!onFileUpload) return;
    const selection = selectFiles(files, file => (acceptsFile(file, accept) ? null : { kind: 'type' }));
    if (selection.leftOut.length > 0) setLeftOut(prev => [...prev, ...selection.leftOut]);
    const tasks = selection.kept.map(file => {
      nextKey.current += 1;
      return { key: `upload-${nextKey.current}`, file, upload: onFileUpload, place, token: token.current };
    });
    setPending(prev => [...prev, ...tasks.map(task => ({ key: task.key, name: task.file.name }))]);
    queue.current.push(...tasks);
    pump();
  };

  const uploadOne = async (row: RowKey, file: File, place: (url: string) => void) => {
    if (!onFileUpload) return;
    reservedRows.current.add(row);
    setUploadingRows(prev => [...prev, row]);
    try {
      const url = await onFileUpload(file);
      if (url) place(url);
    } finally {
      reservedRows.current.delete(row);
      setUploadingRows(prev => prev.filter(key => key !== row));
    }
  };

  const isReserved = (row: RowKey) => reservedRows.current.has(row);

  const cancel = () => {
    token.current += 1;
    queue.current = [];
    reservedRows.current.clear();
    setPending([]);
    setLeftOut([]);
    setUploadingRows([]);
  };

  const dismiss = () => setLeftOut([]);

  return { pending, leftOut, uploadingRows, uploadOne, isReserved, uploadMany, cancel, dismiss };
}
