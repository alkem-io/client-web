import { useConversationStorageConfigQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useConfig } from '@/domain/platform/config/useConfig';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

/**
 * Platform feature-flag name gating conversation media attachments (feature 013).
 * Read via `useConfig().isFeatureEnabled` — string-based, so it safely returns
 * `false` until the server advertises the flag (the plan ships it default-off).
 */
export const CONVERSATION_ATTACHMENTS_FEATURE_FLAG = 'ATTACHMENTS';

export type ConversationStorageConfigResult = {
  /** The conversation bucket config to upload attachments into, or undefined
   *  when the feature is off or the bucket is not reachable (non-member). */
  storageConfig: StorageConfig | undefined;
  /** Whether the attachments feature flag is enabled for this platform. */
  featureEnabled: boolean;
};

/**
 * Resolves the storage configuration for a conversation's attachment bucket
 * (feature 013), gated behind the attachments feature flag.
 *
 * The server slice (013) exposes `Conversation.storageBucket` (READ-gated to
 * conversation members, null when message attachments are disabled). When the
 * flag is on and the viewer is a member, we fetch that bucket and surface its
 * id + policy so `useConversationAttachments` can upload into it. When the flag
 * is off, no conversation is selected, or the bucket is null (non-member /
 * server flag off), this returns `storageConfig: undefined` and the composer's
 * attach affordance stays inert. The render path (Message.attachments) is
 * unaffected either way.
 */
export function useConversationStorageConfig(conversationId: string | undefined): ConversationStorageConfigResult {
  const { isFeatureEnabled } = useConfig();
  const featureEnabled = isFeatureEnabled(CONVERSATION_ATTACHMENTS_FEATURE_FLAG);

  const { data } = useConversationStorageConfigQuery({
    variables: { conversationId: conversationId! },
    skip: !featureEnabled || !conversationId,
  });

  const bucket = data?.lookup.conversation?.storageBucket;

  const storageConfig: StorageConfig | undefined = bucket
    ? {
        storageBucketId: bucket.id,
        allowedMimeTypes: bucket.allowedMimeTypes,
        maxFileSize: bucket.maxFileSize,
        canUpload: (bucket.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.FileUpload),
        // Attachments are staged as temporary documents; the send mutation
        // promotes them, the sweeper reclaims abandoned drafts (FR-012).
        temporaryLocation: true,
      }
    : undefined;

  return { storageConfig: featureEnabled ? storageConfig : undefined, featureEnabled };
}
