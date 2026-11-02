import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { FileUploadRejection, type RowFileUpload } from '@/crd/lib/fileSelection';
import { useRowFileUploads } from './useRowFileUploads';

type Call = { file: File; options?: { silent?: boolean }; resolve: (url: string) => void; reject: (e: unknown) => void };

/** An `onFileUpload` whose calls stay unresolved until the test settles them. */
const createControlledUpload = () => {
  const calls: Call[] = [];
  let settled = 0;
  const upload = vi.fn<RowFileUpload>(
    (file, options) =>
      new Promise<string | null>((resolve, reject) => {
        calls.push({
          file,
          options,
          resolve: url => {
            settled += 1;
            resolve(url);
          },
          reject: e => {
            settled += 1;
            reject(e);
          },
        });
      })
  );
  return { upload, calls, inFlight: () => calls.length - settled };
};

const makeFiles = (count: number, prefix = 'file') =>
  Array.from({ length: count }, (_, i) => new File(['x'], `${prefix}-${i + 1}.pdf`));

const flush = () => act(async () => {});

describe('useRowFileUploads', () => {
  test('never runs more than three uploads at once, each silent', async () => {
    const { upload, calls, inFlight } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, undefined));
    const place = vi.fn();
    let maxInFlight = 0;

    act(() => result.current.uploadMany(makeFiles(6), place));
    while (place.mock.calls.length < 6) {
      maxInFlight = Math.max(maxInFlight, inFlight());
      const next = calls.find((_, i) => i >= place.mock.calls.length);
      await act(async () => next?.resolve(`url-${next.file.name}`));
    }

    expect(maxInFlight).toBe(3);
    expect(upload).toHaveBeenCalledTimes(6);
    for (const call of calls) expect(call.options).toEqual({ silent: true });
  });

  test('a success calls place with the file and URL and drops the file from pending', async () => {
    const { upload, calls } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, undefined));
    const place = vi.fn();
    const files = makeFiles(2);

    act(() => result.current.uploadMany(files, place));
    expect(result.current.pending.map(p => p.name)).toEqual(['file-1.pdf', 'file-2.pdf']);

    await act(async () => calls[1].resolve('url-2'));
    expect(place).toHaveBeenCalledWith(files[1], 'url-2');
    expect(result.current.pending.map(p => p.name)).toEqual(['file-1.pdf']);
  });

  test('a FileUploadRejection reports its reason, any other error reports failed', async () => {
    const { upload, calls } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, undefined));

    act(() => result.current.uploadMany(makeFiles(2), vi.fn()));
    await act(async () => calls[0].reject(new FileUploadRejection({ kind: 'size', maxBytes: 5 })));
    await act(async () => calls[1].reject(new Error('boom')));

    expect(result.current.leftOut).toEqual([
      { name: 'file-1.pdf', reason: { kind: 'size', maxBytes: 5 } },
      { name: 'file-2.pdf', reason: { kind: 'failed' } },
    ]);
    expect(result.current.pending).toEqual([]);
  });

  test('unaccepted types and files past the cap are left out without uploading', () => {
    const { upload } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, '.pdf'));

    act(() => result.current.uploadMany([new File(['x'], 'image.png'), ...makeFiles(25)], vi.fn()));

    expect(result.current.leftOut).toEqual([
      { name: 'image.png', reason: { kind: 'type' } },
      { name: 'file-25.pdf', reason: { kind: 'limit' } },
    ]);
    expect(upload.mock.calls.map(([file]) => file.name)).not.toContain('image.png');
  });

  test('leftOut accumulates across selections until dismissed', () => {
    const { upload } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, '.pdf'));

    act(() => result.current.uploadMany([new File(['x'], 'a.png'), new File(['x'], 'ok.pdf')], vi.fn()));
    act(() => result.current.uploadMany([new File(['x'], 'b.png'), new File(['x'], 'ok2.pdf')], vi.fn()));
    expect(result.current.leftOut.map(f => f.name)).toEqual(['a.png', 'b.png']);

    act(() => result.current.dismiss());
    expect(result.current.leftOut).toEqual([]);
  });

  test('after cancel, late results write nothing and queued files never start', async () => {
    const { upload, calls } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, '.pdf'));
    const place = vi.fn();

    act(() => result.current.uploadMany([new File(['x'], 'bad.png'), ...makeFiles(5)], place));
    expect(result.current.leftOut).toHaveLength(1);
    act(() => result.current.cancel());

    expect(result.current.pending).toEqual([]);
    expect(result.current.leftOut).toEqual([]);

    await act(async () => calls[0].resolve('late-url'));
    await act(async () => calls[1].reject(new Error('late failure')));
    await act(async () => calls[2].resolve('late-url-3'));
    await flush();

    expect(place).not.toHaveBeenCalled();
    expect(result.current.leftOut).toEqual([]);
    expect(result.current.pending).toEqual([]);
    expect(upload).toHaveBeenCalledTimes(3);
  });

  test('after unmount, queued files never start and late results call no place', async () => {
    const { upload, calls } = createControlledUpload();
    const { result, unmount } = renderHook(() => useRowFileUploads(upload, undefined));
    const place = vi.fn();

    act(() => result.current.uploadMany(makeFiles(5), place));
    unmount();
    await act(async () => {
      for (const call of [...calls]) call.resolve('late');
    });
    await flush();

    expect(place).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledTimes(3);
  });

  test('a selection made after a cancel runs normally', async () => {
    const { upload, calls } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, undefined));
    const place = vi.fn();

    act(() => result.current.uploadMany(makeFiles(1, 'old'), vi.fn()));
    act(() => result.current.cancel());
    await act(async () => calls[0].resolve('old-url'));

    const [fresh] = makeFiles(1, 'new');
    act(() => result.current.uploadMany([fresh], place));
    await act(async () => calls[1].resolve('new-url'));

    expect(place).toHaveBeenCalledWith(fresh, 'new-url');
    expect(result.current.pending).toEqual([]);
  });

  test('without an upload callback nothing is uploaded', () => {
    const { result } = renderHook(() => useRowFileUploads(undefined, undefined));
    const place = vi.fn();

    act(() => result.current.uploadMany(makeFiles(2), place));

    expect(place).not.toHaveBeenCalled();
    expect(result.current.pending).toEqual([]);
  });

  test('two selections made before either settles share the limit of three', async () => {
    const { upload, calls, inFlight } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, undefined));
    const place = vi.fn();
    let maxInFlight = 0;

    act(() => result.current.uploadMany(makeFiles(6, 'a'), place));
    act(() => result.current.uploadMany(makeFiles(6, 'b'), place));
    maxInFlight = inFlight();

    let settledCount = 0;
    while (settledCount < 12) {
      const call = calls[settledCount];
      await act(async () => call.resolve(`url-${settledCount}`));
      settledCount += 1;
      maxInFlight = Math.max(maxInFlight, inFlight());
    }

    expect(maxInFlight).toBe(3);
    expect(upload).toHaveBeenCalledTimes(12);
    expect(place).toHaveBeenCalledTimes(12);
  });

  test('cancelled uploads still in flight keep their slots from a new selection', async () => {
    const { upload, calls } = createControlledUpload();
    const { result } = renderHook(() => useRowFileUploads(upload, undefined));

    act(() => result.current.uploadMany(makeFiles(3, 'old'), vi.fn()));
    act(() => result.current.cancel());
    act(() => result.current.uploadMany(makeFiles(3, 'new'), vi.fn()));
    expect(upload).toHaveBeenCalledTimes(3);

    await act(async () => calls[0].resolve('old-1'));
    expect(upload).toHaveBeenCalledTimes(4);
    expect(calls[3].file.name).toBe('new-1.pdf');

    await act(async () => calls[1].reject(new Error('old-2')));
    expect(upload).toHaveBeenCalledTimes(5);
    await act(async () => calls[2].resolve('old-3'));
    expect(upload).toHaveBeenCalledTimes(6);
  });
});
