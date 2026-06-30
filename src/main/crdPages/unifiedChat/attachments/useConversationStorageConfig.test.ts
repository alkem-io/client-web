import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useConversationStorageConfig } from './useConversationStorageConfig';

const mockIsFeatureEnabled = vi.fn();
const mockUseQuery = vi.fn();

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ isFeatureEnabled: mockIsFeatureEnabled }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useConversationStorageConfigQuery: (opts: unknown) => mockUseQuery(opts),
}));

const bucket = {
  id: 'bucket-1',
  allowedMimeTypes: ['image/png'],
  maxFileSize: 1024,
  authorization: { id: 'auth-1', myPrivileges: [AuthorizationPrivilege.FileUpload] },
};

describe('useConversationStorageConfig', () => {
  beforeEach(() => {
    mockIsFeatureEnabled.mockReset();
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({ data: undefined });
  });

  test('skips the query and returns inert when the feature flag is off', () => {
    mockIsFeatureEnabled.mockReturnValue(false);
    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(result.current.featureEnabled).toBe(false);
    expect(result.current.storageConfig).toBeUndefined();
  });

  test('maps the bucket into a writable StorageConfig when present', () => {
    mockIsFeatureEnabled.mockReturnValue(true);
    mockUseQuery.mockReturnValue({ data: { lookup: { conversation: { id: 'conv-1', storageBucket: bucket } } } });

    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
    expect(result.current.storageConfig).toEqual({
      storageBucketId: 'bucket-1',
      allowedMimeTypes: ['image/png'],
      maxFileSize: 1024,
      canUpload: true,
      temporaryLocation: true,
    });
  });

  test('degrades to inert when the bucket is null (non-member / server flag off)', () => {
    mockIsFeatureEnabled.mockReturnValue(true);
    mockUseQuery.mockReturnValue({ data: { lookup: { conversation: { id: 'conv-1', storageBucket: null } } } });

    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));

    expect(result.current.featureEnabled).toBe(true);
    expect(result.current.storageConfig).toBeUndefined();
  });

  test('canUpload is false when the member lacks the FILE_UPLOAD privilege', () => {
    mockIsFeatureEnabled.mockReturnValue(true);
    mockUseQuery.mockReturnValue({
      data: {
        lookup: {
          conversation: { id: 'conv-1', storageBucket: { ...bucket, authorization: { id: 'a', myPrivileges: [] } } },
        },
      },
    });

    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));
    expect(result.current.storageConfig?.canUpload).toBe(false);
  });
});
