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
   *  when the feature is off or the bucket is not (yet) reachable. */
  storageConfig: StorageConfig | undefined;
  /** Whether the attachments feature flag is enabled for this platform. */
  featureEnabled: boolean;
};

/**
 * Resolves the storage configuration for a conversation's attachment bucket
 * (feature 013), gated behind the attachments feature flag.
 *
 * SERVER DEPENDENCY / ROLLOUT NOTE: the server slice (013) creates a per-
 * conversation storage bucket and authorizes it by conversation membership, but
 * the merged GraphQL schema does NOT yet expose that bucket on `Conversation`
 * (no `storageAggregator` / `storageBucket` field). Until the server adds it,
 * the conversation bucket id cannot be fetched from the client, so this hook
 * returns `storageConfig: undefined` and the composer's attach affordance stays
 * inert. The render path (Message.attachments) is fully supported and unaffected.
 *
 * Once the server exposes the bucket (e.g. `Conversation.storageAggregator.
 * directStorageBucket`), wire a `useStorageConfig({ locationType: 'conversation',
 * conversationId, temporaryLocation: true })` lookup here and return its config.
 */
export function useConversationStorageConfig(_conversationId: string | undefined): ConversationStorageConfigResult {
  const { isFeatureEnabled } = useConfig();
  const featureEnabled = isFeatureEnabled(CONVERSATION_ATTACHMENTS_FEATURE_FLAG);

  // Pending the server exposing the conversation bucket (see note above), there
  // is no GraphQL path to the bucket id, so no upload target is available yet.
  const storageConfig = undefined;

  return { storageConfig: featureEnabled ? storageConfig : undefined, featureEnabled };
}
