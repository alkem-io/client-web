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
  attachmentBucketId?: string | null;
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
  externalReference?: string | null;
  displayName: string;
  mimeType?: string | null;
  size?: number | null;
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

/** One resource identity for both GraphQL event projections and native Matrix events. */
export const attachmentReferenceUrl = (bucketId: string, externalReference: string): string => {
  const url = new URL('/api/private/rest/storage/file/by-reference', window.location.origin);
  url.searchParams.set('bucketId', bucketId);
  url.searchParams.set('ref', externalReference);
  return url.href;
};

export const mapMessageAttachments = (
  attachments: GraphQLMessageAttachment[] | null | undefined,
  bucketId?: string | null
): MessageAttachment[] =>
  (attachments ?? []).map(attachment => ({
    // A presentation key, never an Alkemio document ID.
    id: attachment.externalReference ?? undefined,
    url:
      bucketId && attachment.externalReference
        ? attachmentReferenceUrl(bucketId, attachment.externalReference)
        : undefined,
    displayName: attachment.displayName,
    mimeType: attachment.mimeType ?? undefined,
    size: attachment.size ?? undefined,
    width: attachment.width ?? undefined,
    height: attachment.height ?? undefined,
  }));

/**
 * Integration seam for the separate native-read transport. This client still
 * reads messages through GraphQL. The native-read branch must replace its
 * per-attachment resolver hook with this mapper and the loaded room bucket ID;
 * providing this mapper does not activate native sync in the current client.
 */
export const mapMatrixMessageAttachments = (
  content: {
    msgtype?: string;
    url?: string;
    body?: string;
    filename?: string;
    info?: { mimetype?: string; size?: number; w?: number; h?: number };
  },
  homeserver: string,
  bucketId?: string | null,
  eventType?: string
): MessageAttachment[] => {
  if (!['m.image', 'm.video', 'm.audio', 'm.file', 'm.sticker'].includes(content.msgtype ?? eventType ?? '')) return [];
  const prefix = `mxc://${homeserver}/`;
  const mediaId = content.url?.startsWith(prefix) ? content.url.slice(prefix.length) : undefined;
  const externalReference = mediaId && /^[A-Za-z0-9_-]+$/.test(mediaId) ? mediaId : undefined;
  return mapMessageAttachments(
    [
      {
        externalReference,
        displayName: content.filename ?? content.body ?? '',
        mimeType: content.info?.mimetype,
        size: content.info?.size,
        width: content.info?.w,
        height: content.info?.h,
      },
    ],
    bucketId
  );
};
