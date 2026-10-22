import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { commentImageMimeTypes, useCommentImageStorageConfig } from './useCommentImageStorageConfig';

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

const { CreateMessage, CreateMessageReply, Read, FileUpload } = AuthorizationPrivilege;
const member = [Read, CreateMessage, CreateMessageReply];
const imagesOff = { comment: undefined, reply: undefined };

describe('commentImageMimeTypes', () => {
  test('keeps JPEG, PNG, GIF and WebP, in bucket order, and drops HEIC, HEIF, AVIF, SVG and non-images', () => {
    expect(
      commentImageMimeTypes([
        'image/png',
        'image/heic',
        'image/jpeg',
        'image/heif',
        'image/gif',
        'image/avif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'video/mp4',
        'text/plain',
      ])
    ).toEqual(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
  });

  test('keeps only what the bucket allows', () => {
    expect(commentImageMimeTypes(['image/webp', 'image/heic'])).toEqual(['image/webp']);
  });
});

describe('useCommentImageStorageConfig', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('a member with only READ on the bucket may attach to comments and replies: the right to post grants it', () => {
    mockQuery.mockReturnValue(bucket(['image/png', 'image/heic', 'image/svg+xml', 'application/pdf']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', member, false));
    const policy = {
      storageBucketId: 'bucket-1',
      allowedMimeTypes: ['image/png'],
      maxFileSize: 5 * 1024 * 1024,
      canUpload: true,
      temporaryLocation: false,
    };
    expect(result.current).toEqual({ comment: policy, reply: policy });
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: false });
  });

  test('each composer follows its own room right: CREATE_MESSAGE for comments, CREATE_MESSAGE_REPLY for replies', () => {
    mockQuery.mockReturnValue(bucket(['image/png']));
    const { result, rerender } = renderHook(
      ({ privileges }: { privileges: AuthorizationPrivilege[] }) =>
        useCommentImageStorageConfig('bucket-1', privileges, false),
      { initialProps: { privileges: [Read, CreateMessage] } }
    );
    expect(result.current.comment?.canUpload).toBe(true);
    expect(result.current.reply?.canUpload).toBe(false);
    rerender({ privileges: [Read, CreateMessageReply] });
    expect(result.current.comment?.canUpload).toBe(false);
    expect(result.current.reply?.canUpload).toBe(true);
  });

  test('FILE_UPLOAD alone (bucket-level right, no room right) does not enable images, and the bucket is not queried', () => {
    mockQuery.mockReturnValue(bucket(['image/png']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', [Read, FileUpload], false));
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: true });
    expect(result.current.comment?.canUpload ?? false).toBe(false);
    expect(result.current.reply?.canUpload ?? false).toBe(false);
  });

  test('is skipped and off when the caller skips', () => {
    mockQuery.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', member, true));
    expect(result.current).toEqual(imagesOff);
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: true });
  });

  test.each([null, undefined])('is skipped and off without a bucket id (%s)', bucketId => {
    mockQuery.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCommentImageStorageConfig(bucketId, member, false));
    expect(result.current).toEqual(imagesOff);
    expect(mockQuery).toHaveBeenCalledWith({ variables: { bucketId: '' }, skip: true });
  });

  test('is off while loading and on error', () => {
    mockQuery.mockReturnValue({ data: undefined, loading: true });
    const { result, rerender } = renderHook(() => useCommentImageStorageConfig('bucket-1', member, false));
    expect(result.current).toEqual(imagesOff);
    mockQuery.mockReturnValue({ data: undefined, loading: false, error: new Error('forbidden') });
    rerender();
    expect(result.current).toEqual(imagesOff);
  });

  test('is off when the bucket is not readable', () => {
    mockQuery.mockReturnValue({ data: { lookup: { storageBucket: null } } });
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', member, false));
    expect(result.current).toEqual(imagesOff);
  });

  test('is off when the bucket allows no JPEG, PNG, GIF or WebP type', () => {
    mockQuery.mockReturnValue(bucket(['image/heic', 'image/heif', 'image/avif', 'image/svg+xml', 'application/pdf']));
    const { result } = renderHook(() => useCommentImageStorageConfig('bucket-1', member, false));
    expect(result.current).toEqual(imagesOff);
  });
});
