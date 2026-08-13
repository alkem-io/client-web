import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useReferenceFileUpload } from './useReferenceFileUpload';

const uploadFileMock = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [uploadFileMock, { loading: false }],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => vi.fn(),
}));

const baseConfig: StorageConfig = {
  storageBucketId: 'bucket-1',
  allowedMimeTypes: [],
  maxFileSize: 1024,
  canUpload: true,
  temporaryLocation: true,
};

beforeEach(() => {
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
