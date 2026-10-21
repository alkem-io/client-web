import { useCommentRoomStorageBucketQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

/** Comments accept raster images only: any `image/*` type except SVG. */
export const isRasterImageMimeType = (mime: string) => mime.startsWith('image/') && mime !== 'image/svg+xml';

export const rasterImageMimeTypes = (types: readonly string[]) => types.filter(isRasterImageMimeType);

/**
 * Upload policy for a comment room, read from the room's own attachment bucket
 * (the bucket the server stores comment images in), narrowed to raster images.
 * Returns undefined — images off — while loading, on error, when the room has
 * no bucket, or when the bucket allows no raster image type.
 */
export function useCommentImageStorageConfig(
  bucketId: string | null | undefined,
  skip: boolean
): StorageConfig | undefined {
  const { data } = useCommentRoomStorageBucketQuery({
    variables: { bucketId: bucketId ?? '' },
    skip: skip || !bucketId,
  });

  const bucket = data?.lookup.storageBucket;
  const allowed = bucket ? rasterImageMimeTypes(bucket.allowedMimeTypes) : [];
  if (!bucket || allowed.length === 0) return undefined;

  return {
    storageBucketId: bucket.id,
    allowedMimeTypes: allowed,
    maxFileSize: bucket.maxFileSize,
    canUpload: (bucket.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.FileUpload),
    temporaryLocation: false,
  };
}
