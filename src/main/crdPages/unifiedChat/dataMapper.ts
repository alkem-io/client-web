import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { ChatListItem, ChatMessage, GroupMember } from '@/crd/components/chat/types';
import type { CommentAuthor, CommentReaction } from '@/crd/components/comment/types';
import type {
  ConversationMember,
  ConversationMessage,
  MessageReaction,
  UserConversation,
} from '@/main/userMessaging/models';

/** A conversation enriched with unified-chat presentation flags. */
export type UnifiedConversation = UserConversation & {
  isGuidance: boolean;
  pinned: boolean;
};

/**
 * Identifies the dedicated 1:1 Guidance conversation: it includes the guidance
 * VC and has at most two members (the current user + the VC). A 3+ member group
 * that happens to include the VC is a normal group, NOT the pinned guidance item.
 */
export const isGuidanceConversation = (
  members: Pick<ConversationMember, 'id'>[],
  guidanceVcId: string | null
): boolean => {
  if (!guidanceVcId) {
    return false;
  }
  return members.some(m => m.id === guidanceVcId) && members.length <= 2;
};

/**
 * Sorts unified conversations: pinned (guidance) first, then the newly-created
 * conversation, then by most-recent activity (last message, else created date).
 */
export const sortUnifiedConversations = <T extends UnifiedConversation>(
  conversations: T[],
  newlyCreatedConversationId: string | null
): T[] =>
  [...conversations].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    if (a.id === newlyCreatedConversationId) return -1;
    if (b.id === newlyCreatedConversationId) return 1;
    const aTime = a.lastMessage ? a.lastMessage.timestamp : a.createdDate.getTime();
    const bTime = b.lastMessage ? b.lastMessage.timestamp : b.createdDate.getTime();
    return bTime - aTime;
  });

export const mapMemberToCommentAuthor = (member: ConversationMember): CommentAuthor => ({
  id: member.id,
  name: member.displayName,
  avatarUrl: member.avatarUri,
  profileUrl: member.url,
  isVirtualContributor: member.type === ActorType.VirtualContributor,
});

export const mapMembersToGroupMembers = (
  members: ConversationMember[],
  currentUserId: string | undefined
): GroupMember[] =>
  members.map(member => ({
    id: member.id,
    name: member.displayName,
    avatarUrl: member.avatarUri,
    isCurrentUser: member.id === currentUserId,
  }));

/**
 * Groups the flat reaction list (one entry per user per emoji) into the
 * comment-system shape (one entry per emoji with a count + hasReacted).
 */
export const mapReactionsToCommentReactions = (
  reactions: MessageReaction[],
  currentUserId: string | undefined
): CommentReaction[] => {
  const byEmoji = new Map<string, CommentReaction>();
  for (const reaction of reactions) {
    const existing = byEmoji.get(reaction.emoji);
    const senderName = reaction.sender?.profile.displayName ?? '';
    const senderId = reaction.sender?.id;
    if (existing) {
      existing.count += 1;
      if (senderId === currentUserId) existing.hasReacted = true;
      if (senderId) existing.senders?.push({ id: senderId, name: senderName });
    } else {
      byEmoji.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        hasReacted: senderId === currentUserId,
        senders: senderId ? [{ id: senderId, name: senderName }] : [],
      });
    }
  }
  return [...byEmoji.values()];
};

type ListItemOptions = {
  currentUserId: string | undefined;
  formatTimestamp: (timestampMs: number) => string;
};

export const mapConversationToListItem = (
  conv: UnifiedConversation,
  { currentUserId, formatTimestamp }: ListItemOptions
): ChatListItem => {
  const otherMembers = conv.members.filter(m => m.id !== currentUserId);
  return {
    id: conv.id,
    displayName: conv.displayName ?? '',
    avatarUrl: conv.avatarUri,
    isGroup: conv.isGroup,
    isGuidance: conv.isGuidance,
    memberAvatars: otherMembers.map(m => ({ id: m.id, name: m.displayName, avatarUrl: m.avatarUri })),
    lastMessagePreview: conv.lastMessage?.message,
    lastMessageTimestamp: conv.lastMessage ? formatTimestamp(conv.lastMessage.timestamp) : undefined,
    unreadCount: conv.unreadCount,
    pinned: conv.pinned,
  };
};

type MessageOptions = {
  currentUserId: string | undefined;
  formatTimestamp: (timestampMs: number) => string;
};

export const mapMessageToChatMessage = (
  message: ConversationMessage,
  { currentUserId, formatTimestamp }: MessageOptions
): ChatMessage => ({
  id: message.id,
  author: message.sender
    ? {
        id: message.sender.id,
        name: message.sender.displayName,
        avatarUrl: message.sender.avatarUri,
      }
    : undefined,
  content: message.message,
  timestamp: formatTimestamp(message.timestamp),
  timestampMs: message.timestamp,
  reactions: mapReactionsToCommentReactions(message.reactions, currentUserId),
  isOwn: Boolean(currentUserId && message.sender?.id === currentUserId),
});

/** Sentinel id for the synthetic Guidance introduction message. */
export const GUIDANCE_INTRO_ID = '__intro';

/**
 * Always prepends the synthetic Guidance intro message to the guidance thread
 * (matching the legacy `useChatGuidanceCommunication` behavior): when there is no
 * real history the intro is the only message, otherwise it sorts first via
 * `timestampMs: 0`. The intro is never sent, read, or counted toward unread.
 */
export const injectGuidanceIntro = (
  messages: ChatMessage[],
  intro: { text: string; author: CommentAuthor }
): ChatMessage[] => {
  const introMessage: ChatMessage = {
    id: GUIDANCE_INTRO_ID,
    author: intro.author,
    content: intro.text,
    timestamp: '',
    timestampMs: 0,
    reactions: [],
    isOwn: false,
  };
  return messages.length === 0 ? [introMessage] : [introMessage, ...messages];
};
