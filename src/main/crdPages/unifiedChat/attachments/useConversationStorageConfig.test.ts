import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useConversationStorageConfig } from './useConversationStorageConfig';

const mockUseQuery = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useConversationStorageConfigQuery: (opts: unknown) => mockUseQuery(opts),
}));

const bucket = {
  id: 'bucket-1',
  allowedMimeTypes: ['image/png'],
  maxFileSize: 1024,
  authorization: { id: 'auth-1', myPrivileges: [AuthorizationPrivilege.FileUpload] },
};

const withBucket = (storageBucket: unknown) => ({
  data: { lookup: { conversation: { id: 'conv-1', storageBucket } } },
});

describe('useConversationStorageConfig', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({ data: undefined });
  });

  // Regression guard: an earlier revision gated the query on
  // `isFeatureEnabled('ATTACHMENTS')`, which is not a PlatformFeatureFlagName —
  // so the query was skipped forever, storageConfig was always undefined and the
  // composer's attach affordance could never render. Selecting a conversation
  // MUST be enough to ask the server for the bucket; the server's null bucket is
  // the only gate.
  test('queries the conversation bucket whenever a conversation is selected', () => {
    mockUseQuery.mockReturnValue(withBucket(bucket));

    renderHook(() => useConversationStorageConfig('conv-1'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ skip: false, variables: { conversationId: 'conv-1' } })
    );
  });

  test('skips the query and stays inert when no conversation is selected', () => {
    const { result } = renderHook(() => useConversationStorageConfig(undefined));

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(result.current.storageConfig).toBeUndefined();
  });

  test('a present bucket enables attachments (maps into a writable StorageConfig)', () => {
    mockUseQuery.mockReturnValue(withBucket(bucket));

    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));

    expect(result.current.storageConfig).toEqual({
      storageBucketId: 'bucket-1',
      allowedMimeTypes: ['image/png'],
      maxFileSize: 1024,
      canUpload: true,
      temporaryLocation: false,
    });
  });

  test('a null bucket disables attachments (server feature off / non-member)', () => {
    mockUseQuery.mockReturnValue(withBucket(null));

    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));

    expect(result.current.storageConfig).toBeUndefined();
  });

  test('canUpload is false when the member lacks the FILE_UPLOAD privilege', () => {
    mockUseQuery.mockReturnValue(withBucket({ ...bucket, authorization: { id: 'a', myPrivileges: [] } }));

    const { result } = renderHook(() => useConversationStorageConfig('conv-1'));
    expect(result.current.storageConfig?.canUpload).toBe(false);
  });
});
