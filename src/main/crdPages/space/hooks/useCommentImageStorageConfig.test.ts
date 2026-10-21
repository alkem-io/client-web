import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { rasterImageMimeTypes, useCommentImageStorageConfig } from './useCommentImageStorageConfig';

const mockQuery = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCommentRoomStorageBucketQuery: (options: unknown) => mockQuery(options),
}));

const bucket = (
  allowedMimeTypes: string[],
  myPrivileges: AuthorizationPrivilege[] = [AuthorizationPrivilege.FileUpload]
) => ({
  data: {
    lookup: {
      storageBucket: {
        id: 'bucket-1',
        allowedMimeTypes,
        maxFileSize: 5 * 1024 * 1024,
        authorization: { id: 'auth-1', myPrivileges },
      },
    },
  },
});

describe('rasterImageMimeTypes', () => {
  test('keeps raster images and drops SVG and non-images', () => {
    expect(
      rasterImageMimeTypes([
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/avif',
        'image/svg+xml',
        'application/pdf',
        'video/mp4',
        'text/plain',
      ])
    ).toEqual(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif']);
  });
});

describe('useCommentImageStorageConfig', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('narrows the bucket policy to raster images and grants upload with FILE_UPLOAD', () => {
    mockQuery.mockReturnValue(bucket(['image/png', 'image/svg+xml', 'application/pdf']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', false));
    expect(result.current).toEqual({
      storageBucketId: 'bucket-1',
      allowedMimeTypes: ['image/png'],
      maxFileSize: 5 * 1024 * 1024,
      canUpload: true,
      temporaryLocation: false,
    });
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: false });
  });

  test('canUpload is false without FILE_UPLOAD', () => {
    mockQuery.mockReturnValue(bucket(['image/png'], [AuthorizationPrivilege.Read]));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', false));
    expect(result.current?.canUpload).toBe(false);
  });

  test('is skipped and undefined when the caller skips', () => {
    mockQuery.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', true));
    expect(result.current).toBeUndefined();
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: true });
  });

  test.each([null, undefined])('is skipped and undefined without a bucket id (%s)', bucketId => {
    mockQuery.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCommentImageStorageConfig(bucketId, false));
    expect(result.current).toBeUndefined();
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: '' }, skip: true });
  });

  test('is undefined while loading and on error', () => {
    mockQuery.mockReturnValue({ data: undefined, loading: true });
    const { result, rerender } = renderHook(() => useCommentImageStorageConfig('bucket-1', false));
    expect(result.current).toBeUndefined();
    mockQuery.mockReturnValue({ data: undefined, loading: false, error: new Error('forbidden') });
    rerender();
    expect(result.current).toBeUndefined();
  });

  test('is undefined when the bucket is not readable', () => {
    mockQuery.mockReturnValue({ data: { lookup: { storageBucket: null } } });
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', false));
    expect(result.current).toBeUndefined();
  });

  test('is undefined when the bucket allows no raster image type', () => {
    mockQuery.mockReturnValue(bucket(['image/svg+xml', 'application/pdf']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', false));
    expect(result.current).toBeUndefined();
  });
});
