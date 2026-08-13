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
  messagesCount: number;
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

// Attachment shape on a conversation message (feature 013)
export interface MessageAttachmentModel {
  id: string;
  url: string;
  displayName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

// Message type used for conversation messages
export interface ConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: MessageSender;
  reactions: MessageReaction[];
  attachments: MessageAttachmentModel[];
}

// GraphQL sender type (from generated types)
// Sender is now Actor type with id, type, and nullable profile
type GraphQLSender =
  | {
      id: string;
      profile?: {
        displayName?: string;
        avatar?: { uri: string } | null;
      } | null;
    }
  | null
  | undefined;

/** Minimal shape of a GraphQL `MessageAttachment` (feature 013) as selected by
 *  the message documents. Width/height are present for images only. */
type GraphQLMessageAttachment = {
  id: string;
  url: string;
  displayName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
};

type GraphQLReaction =
  | {
      id: string;
      emoji: string;
      timestamp: number;
      sender?: {
        id: string;
        profile?: {
          displayName?: string;
        } | null;
      } | null;
    }
  | null
  | undefined;

/**
 * Maps a GraphQL message sender to our simplified MessageSender type.
 * Supports User and VirtualContributor senders.
 */
export const mapMessageSender = (sender: GraphQLSender): MessageSender | undefined => {
  if (!sender) {
    return undefined;
  }

  return {
    id: sender.id,
    displayName: sender.profile?.displayName ?? '',
    avatarUri: sender.profile?.avatar?.uri,
  };
};

export const mapMessageReactions = (reactions: GraphQLReaction[] | null | undefined): MessageReaction[] => {
  if (!reactions?.length) {
    return [];
  }

  return reactions
    .filter((reaction): reaction is NonNullable<GraphQLReaction> => Boolean(reaction?.id && reaction?.emoji))
    .map(reaction => ({
      id: reaction.id,
      emoji: reaction.emoji,
      timestamp: reaction.timestamp ?? 0,
      sender: reaction.sender
        ? {
            id: reaction.sender.id,
            profile: {
              displayName: reaction.sender.profile?.displayName ?? '',
            },
          }
        : undefined,
    }));
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
    id: attachment.id,
    url: attachment.url,
    displayName: attachment.displayName,
    mimeType: attachment.mimeType,
    size: attachment.size,
    width: attachment.width ?? undefined,
    height: attachment.height ?? undefined,
  }));
};
