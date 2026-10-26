import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCommentImageStorageConfig } from './useCommentImageStorageConfig';

const mockQuery = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCommentRoomStorageBucketQuery: (options: unknown) => mockQuery(options),
}));

const bucket = (allowedMimeTypes: string[]) => ({
  data: {
    lookup: {
      storageBucket: {
        id: 'bucket-1',
        allowedMimeTypes,
        maxFileSize: 5 * 1024 * 1024,
      },
    },
  },
});

const imagesOff = { comment: undefined, reply: undefined };

describe('useCommentImageStorageConfig', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('a member who may comment and reply may attach to both, limited to the JPEG, PNG, GIF and WebP types the bucket allows, in bucket order', () => {
    mockQuery.mockReturnValue(
      bucket([
        'image/png',
        'image/heic',
        'image/jpeg',
        'image/heif',
        'image/gif',
        'image/avif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
      ])
    );
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', true, true));
    const policy = {
      storageBucketId: 'bucket-1',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      maxFileSize: 5 * 1024 * 1024,
      canUpload: true,
      temporaryLocation: false,
    };
    expect(result.current).toEqual({ comment: policy, reply: policy });
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: false });
  });

  test('the reply composer follows the right to reply', () => {
    mockQuery.mockReturnValue(bucket(['image/png']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', true, false));
    expect(result.current.comment?.canUpload).toBe(true);
    expect(result.current.reply?.canUpload).toBe(false);
  });

  test('is skipped and off when the viewer cannot comment, whatever their right on the bucket', () => {
    mockQuery.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', false, true));
    expect(result.current).toEqual(imagesOff);
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: true });
  });

  test.each([null, undefined])('is skipped and off without a bucket id (%s)', bucketId => {
    mockQuery.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCommentImageStorageConfig(bucketId, true, true));
    expect(result.current).toEqual(imagesOff);
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: '' }, skip: true });
  });

  test('is off while loading and on error', () => {
    mockQuery.mockReturnValue({ data: undefined, loading: true });
    const { result, rerender } = renderHook(() => useCommentImageStorageConfig('bucket-1', true, true));
    expect(result.current).toEqual(imagesOff);
    mockQuery.mockReturnValue({ data: undefined, loading: false, error: new Error('forbidden') });
    rerender();
    expect(result.current).toEqual(imagesOff);
  });

  test('is off when the bucket is not readable', () => {
    mockQuery.mockReturnValue({ data: { lookup: { storageBucket: null } } });
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', true, true));
    expect(result.current).toEqual(imagesOff);
  });

  test('is off when the bucket allows no JPEG, PNG, GIF or WebP type', () => {
    mockQuery.mockReturnValue(bucket(['image/heic', 'image/heif', 'image/avif', 'image/svg+xml', 'application/pdf']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', true, true));
    expect(result.current).toEqual(imagesOff);
  });
});
