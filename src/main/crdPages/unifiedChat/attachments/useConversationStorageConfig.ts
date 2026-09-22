import { useConversationStorageConfigQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

export type ConversationStorageConfigResult = {
  storageConfig: StorageConfig | undefined;
};

/** A readable conversation bucket supplies the current upload policy. */
export function useConversationStorageConfig(conversationId: string | undefined): ConversationStorageConfigResult {
  const { data } = useConversationStorageConfigQuery({
    variables: { conversationId: conversationId ?? '' },
    skip: !conversationId,
  });

  const bucket = data?.lookup.conversation?.storageBucket;

  const storageConfig: StorageConfig | undefined = bucket
    ? {
        storageBucketId: bucket.id,
        allowedMimeTypes: bucket.allowedMimeTypes,
        maxFileSize: bucket.maxFileSize,
        canUpload: (bucket.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.FileUpload),
        temporaryLocation: false,
      }
    : undefined;

  return { storageConfig };
}
