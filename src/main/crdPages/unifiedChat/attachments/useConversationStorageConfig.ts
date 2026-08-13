import { useConversationStorageConfigQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

export type ConversationStorageConfigResult = {
  /** The conversation bucket config to upload attachments into, or undefined
   *  when attachments are unavailable for this conversation (feature disabled
   *  server-side, or the viewer is not a member). */
  storageConfig: StorageConfig | undefined;
};

/**
 * Resolves the storage configuration for a conversation's attachment bucket
 * (feature 013).
 *
 * There is deliberately NO client-side feature flag here. Attachments are gated
 * server-side on the `communications.message_attachments.enabled` CONFIG key,
 * which is not — and is not intended to be — a `PlatformFeatureFlagName`; the
 * platform flag enum only carries COMMUNICATIONS, COMMUNICATIONS_DISCUSSIONS,
 * SUBSCRIPTIONS, NOTIFICATIONS, WHITEBOARDS, MEMO, LANDING_PAGE and
 * GUIDENCE_ENGINE. The server already collapses every reason attachments are
 * unavailable — feature off, viewer not a conversation member, bucket not
 * readable — into a single authoritative signal: `Conversation.storageBucket`
 * is null. So the presence of a non-null bucket IS the gate, and adding a
 * second client-side gate on top could only ever be wrong (as an earlier
 * revision of this hook was: it gated on a string that is not in the enum, so
 * `isFeatureEnabled` returned false forever and the composer never activated).
 *
 * When the bucket resolves, its id + policy are surfaced so
 * `useConversationAttachments` can upload into it. When it is null (or no
 * conversation is selected) this returns `storageConfig: undefined` and the
 * composer's attach affordance stays inert. The render path
 * (`Message.attachments`) is unaffected either way.
 */
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
        // Attachments are staged as temporary documents; the send mutation
        // promotes them, the sweeper reclaims abandoned drafts (FR-012).
        temporaryLocation: true,
      }
    : undefined;

  return { storageConfig };
}
