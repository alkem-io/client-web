import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useReferenceFileUpload } from './useReferenceFileUpload';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [vi.fn(), { loading: false }],
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
