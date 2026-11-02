import { useEffect, useRef, useState } from 'react';
import {
  acceptsFile,
  FileUploadRejection,
  type LeftOutFile,
  MAX_CONCURRENT_UPLOADS,
  type RowFileUpload,
  selectFiles,
} from '@/crd/lib/fileSelection';

/** The row a pending upload writes into. A numeric row is a position: `rowRemoved` keeps it on the
 *  same row as rows above it go, and sets it to null when that row itself is removed. */
type RowTarget<Row> = { row: Row | null; reserves: boolean; open: number };

type UploadTask<Row> = {
  key: string;
  file: File;
  upload: RowFileUpload;
  target: RowTarget<Row>;
  place: (file: File, url: string, row: Row | null) => void;
  token: number;
};

/**
 * Owns every upload of a row-list surface and the row each one writes into. A one-file pick
 * (`uploadOne`) runs at once with the host's own failure handling and reserves its row until it
 * settles, so `isReserved` tells batch placement to append instead of filling that row; its result
 * is dropped if its row was removed. Multi-file selections made on any row join one queue, and at
 * most `MAX_CONCURRENT_UPLOADS` run at a time. `cancel()` and unmount stop queued files from
 * starting and make late batch results write nothing; a cancelled upload still holds its slot
 * until it settles. Hosts that address rows by position call `rowRemoved` whenever they remove one.
 */
export function useRowFileUploads<Row extends string | number>(
  onFileUpload: RowFileUpload | undefined,
  accept: string | undefined
) {
  const [pending, setPending] = useState<{ key: string; name: string }[]>([]);
  const [leftOut, setLeftOut] = useState<LeftOutFile[]>([]);
  const [uploadingRows, setUploadingRows] = useState<Row[]>([]);
  const targets = useRef(new Set<RowTarget<Row>>());
  const queue = useRef<UploadTask<Row>[]>([]);
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

  const showUploading = () =>
    setUploadingRows(
      [...targets.current].flatMap(target => (target.reserves && target.row !== null ? [target.row] : []))
    );

  const track = (row: Row, reserves: boolean, open: number) => {
    const target: RowTarget<Row> = { row, reserves, open };
    targets.current.add(target);
    return target;
  };

  const release = (target: RowTarget<Row>) => {
    target.open -= 1;
    if (target.open === 0) targets.current.delete(target);
  };

  const run = async (task: UploadTask<Row>) => {
    const isCurrent = () => task.token === token.current;
    try {
      const url = await task.upload(task.file, { silent: true });
      if (!url) throw new FileUploadRejection({ kind: 'failed' });
      if (isCurrent()) task.place(task.file, url, task.target.row);
    } catch (error) {
      if (isCurrent()) {
        const reason = error instanceof FileUploadRejection ? error.reason : { kind: 'failed' as const };
        setLeftOut(prev => [...prev, { name: task.file.name, reason }]);
      }
    } finally {
      release(task.target);
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

  const uploadMany = (row: Row, files: File[], place: (file: File, url: string, row: Row | null) => void) => {
    if (!onFileUpload) return;
    const selection = selectFiles(files, file => (acceptsFile(file, accept) ? null : { kind: 'type' }));
    if (selection.leftOut.length > 0) setLeftOut(prev => [...prev, ...selection.leftOut]);
    if (selection.kept.length === 0) return;
    const target = track(row, false, selection.kept.length);
    const tasks = selection.kept.map(file => {
      nextKey.current += 1;
      return { key: `upload-${nextKey.current}`, file, upload: onFileUpload, target, place, token: token.current };
    });
    setPending(prev => [...prev, ...tasks.map(task => ({ key: task.key, name: task.file.name }))]);
    queue.current.push(...tasks);
    pump();
  };

  const uploadOne = async (row: Row, file: File, place: (url: string, row: Row) => void) => {
    if (!onFileUpload) return;
    const target = track(row, true, 1);
    showUploading();
    try {
      const url = await onFileUpload(file);
      if (url && target.row !== null) place(url, target.row);
    } finally {
      release(target);
      showUploading();
    }
  };

  const isReserved = (row: Row) => [...targets.current].some(target => target.reserves && target.row === row);

  const rowRemoved = (index: number) => {
    for (const target of targets.current) {
      if (typeof target.row !== 'number') continue;
      if (target.row === index) target.row = null;
      else if (target.row > index) target.row = (target.row - 1) as Row;
    }
    showUploading();
  };

  const cancel = () => {
    token.current += 1;
    for (const task of queue.current) release(task.target);
    queue.current = [];
    for (const target of targets.current) target.reserves = false;
    setPending([]);
    setLeftOut([]);
    setUploadingRows([]);
  };

  const dismiss = () => setLeftOut([]);

  return { pending, leftOut, uploadingRows, uploadOne, isReserved, uploadMany, rowRemoved, cancel, dismiss };
}
