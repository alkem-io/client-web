import { useCommentRoomStorageBucketQuery } from '@/core/apollo/generated/apollo-hooks';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

/**
 * Comments accept JPEG, PNG, GIF and WebP images only — the types every
 * browser renders inline and whose uploads carry no location or device
 * metadata. HEIC, HEIF and AVIF are left out. The server enforces the same set.
 */
const COMMENT_IMAGE_MIME_TYPES: ReadonlySet<string> = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

/** Upload policy for each comment-room composer; undefined means images are off for it. */
export type CommentImageStorageConfigs = {
  comment: StorageConfig | undefined;
  reply: StorageConfig | undefined;
};

const IMAGES_OFF: CommentImageStorageConfigs = { comment: undefined, reply: undefined };

/**
 * Upload policy for a comment room's composers. The accepted types and size
 * limit come from the room's attachment bucket (the bucket the server stores
 * comment images in), narrowed to JPEG, PNG, GIF and WebP. The right to attach follows
 * the right to post, as the server enforces it: CREATE_MESSAGE on the room for
 * a top-level comment, CREATE_MESSAGE_REPLY for a reply. The bucket is the
 * space's shared one, on which ordinary members hold only READ, so its own
 * FILE_UPLOAD privilege says nothing about whether a member may attach.
 *
 * Both policies are undefined — images off — while loading, on error, when the
 * viewer cannot comment, when the room has no bucket, or when the bucket allows
 * none of those types.
 */
export function useCommentImageStorageConfig(
  bucketId: string | null | undefined,
  canComment: boolean,
  canReply: boolean
): CommentImageStorageConfigs {
  const { data } = useCommentRoomStorageBucketQuery({
    variables: { bucketId: bucketId ?? '' },
    skip: !canComment || !bucketId,
  });

  const bucket = data?.lookup.storageBucket;
  const allowed = bucket?.allowedMimeTypes.filter(mime => COMMENT_IMAGE_MIME_TYPES.has(mime)) ?? [];
  if (!bucket || allowed.length === 0) return IMAGES_OFF;

  const policy = (canUpload: boolean): StorageConfig => ({
    storageBucketId: bucket.id,
    allowedMimeTypes: allowed,
    maxFileSize: bucket.maxFileSize,
    canUpload,
    temporaryLocation: false,
  });
  return { comment: policy(canComment), reply: policy(canReply) };
}
