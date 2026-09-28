import type { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { MessageAttachment } from '@/crd/components/comment/types';
/**
 * Shared types and utilities for user messaging
 */
export interface ConversationMember {
  id: string;
  type: ActorType;
  displayName: string;
  avatarUri?: string;
  url?: string;
}

export interface UserConversation {
  id: string;
  roomId: string;
  isGroup: boolean;
  displayName?: string;
  /** Raw room displayName from server (undefined when auto-generated). Use for editing, not display. */
  roomDisplayName?: string;
  avatarUri?: string;
  unreadCount: number;
  createdDate: Date;
  lastMessage?: ConversationMessage;
  members: ConversationMember[];
}

// Message sender type used across messaging components
export interface MessageSender {
  id: string;
  displayName: string;
  avatarUri?: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  timestamp: number;
  sender?: {
    id: string;
    profile: {
      displayName: string;
    };
  };
}

// Attachment shape on a conversation message (feature 013). These values flow
// straight through `mapMessageToChatMessage` into `ChatMessage.attachments`,
// which is typed `MessageAttachment[]` — so the CRD render contract is the
// single source of truth. Re-declaring the fields here lets optional ones drift
// apart without a type error.
export type MessageAttachmentModel = MessageAttachment;

// Message type used for conversation messages
export interface ConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: MessageSender;
  reactions: MessageReaction[];
  attachments: MessageAttachmentModel[];
}

/** Minimal shape of a GraphQL `MessageAttachment` (feature 013) as selected by
 *  the message documents. Width/height are present for images only. */
type GraphQLMessageAttachment = {
  id?: string | null;
  url?: string | null;
  displayName: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Maps the GraphQL `Message.attachments` selection to the plain CRD
 * `MessageAttachment[]` consumed by the render components. `url` is already an
 * authorized Alkemio document URL (web- or Element-origin), so the mapping is a
 * uniform field copy with no origin-specific handling.
 */
export const mapMessageAttachments = (
  attachments: GraphQLMessageAttachment[] | null | undefined
): MessageAttachment[] => {
  if (!attachments?.length) {
    return [];
  }

  return attachments.map(attachment => ({
    id: attachment.id ?? undefined,
    url: attachment.url ?? undefined,
    displayName: attachment.displayName,
    mimeType: attachment.mimeType ?? undefined,
    size: attachment.size ?? undefined,
    width: attachment.width ?? undefined,
    height: attachment.height ?? undefined,
  }));
};
