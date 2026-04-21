export type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
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
  timestamp: string;
  parentId?: string;
  isDeleted?: boolean;
  reactions: CommentReaction[];
  canDelete: boolean;
};

export type CommentsContainerData = {
  comments: CommentData[];
  currentUser?: CommentAuthor;
  loading?: boolean;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
};
