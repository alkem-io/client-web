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

/**
 * One upload queue per row-list surface: every multi-file selection made on any of its rows
 * joins it, and at most `MAX_CONCURRENT_UPLOADS` run at a time. `cancel()` and unmount stop
 * queued files from starting and make late results write nothing; a cancelled upload still
 * holds its slot until it settles.
 */
export function useRowFileUploads(onFileUpload: RowFileUpload | undefined, accept: string | undefined) {
  const [pending, setPending] = useState<{ key: string; name: string }[]>([]);
  const [leftOut, setLeftOut] = useState<LeftOutFile[]>([]);
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

  const cancel = () => {
    token.current += 1;
    queue.current = [];
    setPending([]);
    setLeftOut([]);
  };

  const dismiss = () => setLeftOut([]);

  return { pending, leftOut, uploadMany, cancel, dismiss };
}
