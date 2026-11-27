import { useEffect, useRef, useState } from 'react';
import {
  FileUploadRejection,
  type LeftOutFile,
  MAX_CONCURRENT_UPLOADS,
  type RowFileUpload,
  selectFiles,
} from '@/crd/lib/fileSelection';

type UploadTask = {
  key: string;
  file: File;
  place: (file: File, url: string) => void;
  token: number;
};

/**
 * Uploads one multi-file selection of a row-list surface, at most `MAX_CONCURRENT_UPLOADS` at a
 * time, each `{ silent: true }`; a success calls `place`, a failure is named in `leftOut`. One
 * selection at a time: while `busy`, the surface disables its pickers and `uploadMany` does nothing.
 * `cancel()` and unmount stop queued files from starting and make late results write nothing; a
 * cancelled upload still counts as `busy` until it settles.
 */
export function useRowFileUploads(onFileUpload: RowFileUpload | undefined) {
  const [pending, setPending] = useState<{ key: string; name: string }[]>([]);
  const [leftOut, setLeftOut] = useState<LeftOutFile[]>([]);
  const [busy, setBusy] = useState(false);
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

  const isBusy = () => active.current > 0 || queue.current.length > 0;

  const run = async (upload: RowFileUpload, task: UploadTask) => {
    const isCurrent = () => task.token === token.current;
    try {
      const url = await upload(task.file, { silent: true });
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
      pump(upload);
    }
  };

  const pump = (upload: RowFileUpload) => {
    while (active.current < MAX_CONCURRENT_UPLOADS) {
      const task = queue.current.shift();
      if (!task) break;
      active.current += 1;
      void run(upload, task);
    }
    setBusy(isBusy());
  };

  const uploadMany = (files: File[], place: (file: File, url: string) => void) => {
    if (!onFileUpload || isBusy()) return;
    const selection = selectFiles(files);
    if (selection.leftOut.length > 0) setLeftOut(prev => [...prev, ...selection.leftOut]);
    const tasks = selection.kept.map(file => {
      nextKey.current += 1;
      return { key: `upload-${nextKey.current}`, file, place, token: token.current };
    });
    setPending(prev => [...prev, ...tasks.map(task => ({ key: task.key, name: task.file.name }))]);
    queue.current.push(...tasks);
    pump(onFileUpload);
  };

  const cancel = () => {
    token.current += 1;
    queue.current = [];
    setPending([]);
    setLeftOut([]);
    setBusy(isBusy());
  };

  const dismiss = () => setLeftOut([]);

  return { pending, leftOut, busy, uploadMany, cancel, dismiss };
}
