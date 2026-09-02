export type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
  /** True when the author is a Virtual Contributor — drives the VC indicator badge. */
  isVirtualContributor?: boolean;
};

export type CommentReactionSender = {
  id: string;
  name: string;
};

export type CommentReaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
  senders?: CommentReactionSender[];
};

export type CommentData = {
  id: string;
  author: CommentAuthor;
  content: string;
  /** Pre-formatted relative-time display string (e.g. "2 minutes ago",
   *  "just now"). Produced by the integration-layer mapper via
   *  `formatTimeElapsed` so the CRD component renders it as-is. The mapper's
   *  consumer is expected to re-run periodically (see `useNow` in
   *  `useCrdRoomComments`) to keep the string current. */
  timestamp: string;
  /** Raw epoch milliseconds for the message. Used by `CommentThread` to
   *  sort comments numerically (newest-first for top-level, oldest-first
   *  for replies within a parent). Kept separate from `timestamp` because
   *  the display string ("2 minutes ago") cannot be reliably parsed back
   *  into a Date. */
  timestampMs: number;
  parentId?: string;
  isDeleted?: boolean;
  reactions: CommentReaction[];
  canDelete: boolean;
};

export type CommentsContainerData = {
  comments: CommentData[];
  currentUser?: CommentAuthor;
  loading?: boolean;
  /** Whether the current viewer is allowed to post / reply / react.
   *  When false, per-comment Reply, the add-reaction picker, and the reaction
   *  pill toggles are rendered non-interactive. Existing reaction pills and
   *  per-comment Delete (gated separately by `comment.canDelete`) remain
   *  visible. Defaults to true for backwards compatibility. */
  canComment?: boolean;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
};

/**
 * Shape of a single @mention suggestion as rendered by the CRD comment input.
 * The `id` doubles as the mention's stable link target — we use the contributor's
 * profile URL so the resulting markdown `[@Name](url)` works as a real link.
 */
export type CrdMentionSuggestion = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  virtualContributor?: boolean;
};

/**
 * Async search callback supplied by the integration layer. Called by
 * react-mentions each time the `@`-query changes; returns suggestions to render.
 */
export type CrdMentionSearch = (query: string) => Promise<CrdMentionSuggestion[]>;
