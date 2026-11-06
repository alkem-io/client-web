import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FileUploadRejection } from '@/crd/lib/fileSelection';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useReferenceFileUpload } from './useReferenceFileUpload';

const uploadFileMock = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [uploadFileMock, { loading: false }],
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));

const baseConfig: StorageConfig = {
  storageBucketId: 'bucket-1',
  allowedMimeTypes: [],
  maxFileSize: 1024,
  canUpload: true,
  temporaryLocation: true,
};

beforeEach(() => {
  notifyMock.mockReset();
  uploadFileMock.mockReset();
  uploadFileMock.mockResolvedValue({ data: { uploadFileOnStorageBucket: { url: 'https://cdn/file' } } });
});

describe('useReferenceFileUpload accept derivation', () => {
  test('offers .ics when text/calendar is allowed (server#6159 / server#6194)', () => {
    const storageConfig: StorageConfig = {
      ...baseConfig,
      allowedMimeTypes: ['application/pdf', 'text/calendar'],
    };

    const { result } = renderHook(() => useReferenceFileUpload(storageConfig));

    expect(result.current.accept).toBeDefined();
    expect(result.current.accept?.split(',')).toContain('.ics');
    expect(result.current.accept?.split(',')).toContain('.pdf');
  });

  test('does not offer .ics when text/calendar is not allowed', () => {
    const storageConfig: StorageConfig = {
      ...baseConfig,
      allowedMimeTypes: ['application/pdf'],
    };

    const { result } = renderHook(() => useReferenceFileUpload(storageConfig));

    expect(result.current.accept?.split(',')).not.toContain('.ics');
  });
});

describe('useReferenceFileUpload temporaryLocation resolution (issue #10126)', () => {
  const file = new File(['x'], 'ref.pdf', { type: 'application/pdf' });

  test('edit flow (storageConfig.temporaryLocation=false, no override) uploads permanently', async () => {
    // Regression for #10126: an existing entity's reference upload must NOT be
    // temporary, otherwise it is never propagated to `file_backup_outbox`.
    const storageConfig: StorageConfig = { ...baseConfig, temporaryLocation: false };

    const { result } = renderHook(() => useReferenceFileUpload(storageConfig));
    await result.current.onFileUpload?.(file);

    expect(uploadFileMock).toHaveBeenCalledTimes(1);
    expect(uploadFileMock.mock.calls[0][0].variables.uploadData).toMatchObject({
      storageBucketId: 'bucket-1',
      temporaryLocation: false,
    });
  });

  test('create flow (storageConfig.temporaryLocation=true, no override) uploads temporarily', async () => {
    const storageConfig: StorageConfig = { ...baseConfig, temporaryLocation: true };

    const { result } = renderHook(() => useReferenceFileUpload(storageConfig));
    await result.current.onFileUpload?.(file);

    expect(uploadFileMock.mock.calls[0][0].variables.uploadData.temporaryLocation).toBe(true);
  });

  test('explicit temporaryLocation option overrides the resolved storageConfig value', async () => {
    const storageConfig: StorageConfig = { ...baseConfig, temporaryLocation: false };

    const { result } = renderHook(() => useReferenceFileUpload(storageConfig, { temporaryLocation: true }));
    await result.current.onFileUpload?.(file);

    expect(uploadFileMock.mock.calls[0][0].variables.uploadData.temporaryLocation).toBe(true);
  });
});

describe('useReferenceFileUpload silent mode', () => {
  const file = new File(['x'], 'ref.pdf', { type: 'application/pdf' });
  const oversized = new File(['x'.repeat(2048)], 'big.pdf', { type: 'application/pdf' });

  test('a successful silent upload resolves to the URL and notifies nothing', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));

    await expect(result.current.onFileUpload?.(file, { silent: true })).resolves.toBe('https://cdn/file');
    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('a silent upload skips the global error handler', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));
    await result.current.onFileUpload?.(file, { silent: true });

    expect(uploadFileMock.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });

  test('an oversized silent upload rejects with the size limit, sends nothing and notifies nothing', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));

    const rejection = await result.current.onFileUpload?.(oversized, { silent: true }).catch(error => error);
    expect(rejection).toBeInstanceOf(FileUploadRejection);
    expect(rejection.reason).toEqual({ kind: 'size', maxBytes: 1024 });
    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('a mutation error and a missing URL each reject as failed and notify nothing', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));

    uploadFileMock.mockRejectedValueOnce(new Error('network'));
    const networkFailure = await result.current.onFileUpload?.(file, { silent: true }).catch(error => error);
    expect(networkFailure).toBeInstanceOf(FileUploadRejection);
    expect(networkFailure.reason).toEqual({ kind: 'failed' });

    uploadFileMock.mockResolvedValueOnce({ data: { uploadFileOnStorageBucket: { url: '' } } });
    const missingUrl = await result.current.onFileUpload?.(file, { silent: true }).catch(error => error);
    expect(missingUrl).toBeInstanceOf(FileUploadRejection);
    expect(missingUrl.reason).toEqual({ kind: 'failed' });

    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('a non-silent upload keeps the global error handler and its notifications', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));
    await expect(result.current.onFileUpload?.(file)).resolves.toBe('https://cdn/file');
    expect(uploadFileMock.mock.calls[0][0].context).toBeUndefined();
    expect(notifyMock).toHaveBeenCalledWith('components.file-upload.file-upload-success', 'success');

    uploadFileMock.mockRejectedValueOnce(new Error('network'));
    await expect(result.current.onFileUpload?.(file)).resolves.toBeNull();
    expect(notifyMock).toHaveBeenLastCalledWith('components.file-upload.file-upload-error', 'error');
  });
});

describe('useReferenceFileUpload ownFailureToast: false', () => {
  const file = new File(['x'], 'ref.pdf', { type: 'application/pdf' });
  const oversized = new File(['x'.repeat(2048)], 'big.pdf', { type: 'application/pdf' });

  test('a failed upload resolves to null without its own error notification', async () => {
    uploadFileMock.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig, { ownFailureToast: false }));

    await expect(result.current.onFileUpload?.(file)).resolves.toBeNull();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('size and success notifications are unchanged', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig, { ownFailureToast: false }));

    await expect(result.current.onFileUpload?.(oversized)).resolves.toBeNull();
    expect(notifyMock).toHaveBeenLastCalledWith('components.file-upload.file-size-error', 'error');

    await expect(result.current.onFileUpload?.(file)).resolves.toBe('https://cdn/file');
    expect(notifyMock).toHaveBeenLastCalledWith('components.file-upload.file-upload-success', 'success');
  });
});

describe('useReferenceFileUpload type check (silent only, declared type against the bucket list)', () => {
  const typed = (type: string) => new File(['x'], 'file', { type });
  const allowed = ['application/pdf', 'text/csv', 'application/rtf', 'application/vnd.oasis.opendocument.graphics'];

  test('files of each allowed declared type reach the mutation', async () => {
    const { result } = renderHook(() => useReferenceFileUpload({ ...baseConfig, allowedMimeTypes: allowed }));

    for (const type of allowed) {
      await expect(result.current.onFileUpload?.(typed(type), { silent: true })).resolves.toBe('https://cdn/file');
    }
    expect(uploadFileMock).toHaveBeenCalledTimes(allowed.length);
  });

  test('an unlisted or empty declared type rejects as type, with no mutation and no notification', async () => {
    const { result } = renderHook(() => useReferenceFileUpload({ ...baseConfig, allowedMimeTypes: allowed }));

    for (const type of ['application/zip', '']) {
      const rejection = await result.current.onFileUpload?.(typed(type), { silent: true }).catch(error => error);
      expect(rejection).toBeInstanceOf(FileUploadRejection);
      expect(rejection.reason).toEqual({ kind: 'type' });
    }
    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('an empty allowed list rejects no file for its type', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));

    await expect(result.current.onFileUpload?.(typed('application/zip'), { silent: true })).resolves.toBe(
      'https://cdn/file'
    );
  });

  test('a one-file (non-silent) upload sends any type to the mutation unchanged', async () => {
    const { result } = renderHook(() => useReferenceFileUpload({ ...baseConfig, allowedMimeTypes: allowed }));

    await expect(result.current.onFileUpload?.(typed('text/plain'))).resolves.toBe('https://cdn/file');
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
  });
});

describe('useReferenceFileUpload uploading', () => {
  const file = new File(['x'], 'ref.pdf', { type: 'application/pdf' });
  const oversized = new File(['x'.repeat(2048)], 'big.pdf', { type: 'application/pdf' });

  const deferredUpload = () => {
    let settle: (url: string | null) => void = () => {};
    uploadFileMock.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        settle = url =>
          url === null ? reject(new Error('network')) : resolve({ data: { uploadFileOnStorageBucket: { url } } });
      })
    );
    return (url: string | null) => settle(url);
  };

  test('is true from the first unsettled call to the last settlement, silent or not', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));
    expect(result.current.uploading).toBe(false);

    const settleSilent = deferredUpload();
    const settleLoud = deferredUpload();
    let silentCall: Promise<unknown> = Promise.resolve();
    let loudCall: Promise<unknown> = Promise.resolve();
    act(() => {
      silentCall = result.current.onFileUpload?.(file, { silent: true }).catch(() => undefined) ?? silentCall;
      loudCall = result.current.onFileUpload?.(file) ?? loudCall;
    });
    expect(result.current.uploading).toBe(true);

    await act(async () => {
      settleSilent(null);
      await silentCall;
    });
    expect(result.current.uploading).toBe(true);

    await act(async () => {
      settleLoud('https://cdn/file');
      await loudCall;
    });
    expect(result.current.uploading).toBe(false);
  });

  test('stays false for a size rejection', async () => {
    const { result } = renderHook(() => useReferenceFileUpload(baseConfig));

    await act(async () => {
      await result.current.onFileUpload?.(oversized);
      await result.current.onFileUpload?.(oversized, { silent: true }).catch(() => undefined);
    });
    expect(result.current.uploading).toBe(false);
  });
});
