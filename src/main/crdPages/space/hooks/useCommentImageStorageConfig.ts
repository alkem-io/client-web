import { useCommentRoomStorageBucketQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

/** Comments accept raster images only: any `image/*` type except SVG. */
export const isRasterImageMimeType = (mime: string) => mime.startsWith('image/') && mime !== 'image/svg+xml';

export const rasterImageMimeTypes = (types: readonly string[]) => types.filter(isRasterImageMimeType);

/** Upload policy for each comment-room composer; undefined means images are off for it. */
export type CommentImageStorageConfigs = {
  comment: StorageConfig | undefined;
  reply: StorageConfig | undefined;
};

const IMAGES_OFF: CommentImageStorageConfigs = { comment: undefined, reply: undefined };

/**
 * Upload policy for a comment room's composers. The accepted types and size
 * limit come from the room's attachment bucket (the bucket the server stores
 * comment images in), narrowed to raster images. The right to attach follows
 * the right to post, as the server enforces it: CREATE_MESSAGE on the room for
 * a top-level comment, CREATE_MESSAGE_REPLY for a reply. The bucket is the
 * space's shared one, on which ordinary members hold only READ, so its own
 * FILE_UPLOAD privilege says nothing about whether a member may attach.
 *
 * Both policies are undefined — images off — while loading, on error, when the
 * room has no bucket, or when the bucket allows no raster image type.
 */
export function useCommentImageStorageConfig(
  bucketId: string | null | undefined,
  roomPrivileges: readonly AuthorizationPrivilege[],
  skip: boolean
): CommentImageStorageConfigs {
  const canComment = roomPrivileges.includes(AuthorizationPrivilege.CreateMessage);
  const canReply = roomPrivileges.includes(AuthorizationPrivilege.CreateMessageReply);
  const { data } = useCommentRoomStorageBucketQuery({
    variables: { bucketId: bucketId ?? '' },
    skip: skip || !bucketId || !(canComment || canReply),
  });

  const bucket = data?.lookup.storageBucket;
  const allowed = bucket ? rasterImageMimeTypes(bucket.allowedMimeTypes) : [];
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
