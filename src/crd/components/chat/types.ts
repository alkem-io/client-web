import type { CommentAuthor, CommentReaction } from '@/crd/components/comment/types';

/** A single avatar shown in a group composite avatar. */
export type ChatMemberAvatar = {
  id: string;
  name: string;
  avatarUrl?: string;
};

/** A row in the unified conversation list. Pure presentational shape. */
export type ChatListItem = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isGroup: boolean;
  /** The pinned Guidance AI conversation. */
  isGuidance: boolean;
  /** Members for the group composite avatar (excludes the current user). */
  memberAvatars?: ChatMemberAvatar[];
  lastMessagePreview?: string;
  /** Pre-formatted relative-time display string for the last message. */
  lastMessageTimestamp?: string;
  unreadCount: number;
  /** True for the Guidance row; sorts first while search is empty. */
  pinned?: boolean;
};

/** A single message in a thread. Shape compatible with the comment system. */
export type ChatMessage = {
  id: string;
  /** Undefined for synthetic/system messages. */
  author?: CommentAuthor;
  content: string;
  /** Pre-formatted relative-time display string. */
  timestamp: string;
  /** Raw epoch milliseconds; sort key. Synthetic intro uses 0 to sort first. */
  timestampMs: number;
  reactions: CommentReaction[];
  /** Authored by the current user → right-aligned bubble. */
  isOwn: boolean;
  /** Optimistic send, not yet confirmed by the server. */
  isPending?: boolean;
};

/** A member shown in group settings / used by the group composite avatar. */
export type GroupMember = {
  id: string;
  name: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
};

/** Header model for the conversation/thread view. */
export type ChatThreadHeader = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isGroup: boolean;
  isGuidance: boolean;
  memberCount?: number;
  members?: GroupMember[];
  /** Whether the current user may open group settings. */
  canManage?: boolean;
};
