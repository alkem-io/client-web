import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { CommentData, CommentReaction } from '@/crd/components/comment/types';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';

type RoomWithMessages = Pick<CommentsWithMessagesModel, 'messages' | 'authorization'>;

type MapRoomToCommentDataOptions = {
  currentUserId?: string;
};

export function mapRoomToCommentData(
  room: RoomWithMessages | undefined,
  options: MapRoomToCommentDataOptions = {}
): CommentData[] {
  if (!room) {
    return [];
  }

  const { currentUserId } = options;
  const canDeleteAny = room.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false;

  const messageIds = new Set(room.messages.map(message => message.id));

  const comments: CommentData[] = room.messages.map(message => {
    const authorId = message.sender?.id;
    const canDelete = canDeleteAny || (Boolean(currentUserId) && authorId === currentUserId);

    return {
      id: message.id,
      author: {
        id: authorId ?? 'unknown',
        name: message.sender?.profile?.displayName ?? 'Unknown',
        avatarUrl: message.sender?.profile?.avatar?.uri,
      },
      content: message.message,
      timestamp: new Date(message.timestamp).toISOString(),
      parentId: message.threadID,
      reactions: mapReactions(message.reactions, currentUserId),
      canDelete,
    };
  });

  const placeholders = room.messages.reduce<Record<string, CommentData>>((restored, message) => {
    const parentId = message.threadID;

    if (!parentId || messageIds.has(parentId)) {
      return restored;
    }

    const existing = restored[parentId];
    const timestamp = new Date(message.timestamp).toISOString();

    if (!existing) {
      restored[parentId] = {
        id: parentId,
        author: {
          id: 'deleted',
          name: 'Deleted user',
        },
        content: '',
        timestamp,
        reactions: [],
        canDelete: false,
        isDeleted: true,
      };
    } else if (new Date(existing.timestamp).getTime() > message.timestamp) {
      restored[parentId] = {
        ...existing,
        timestamp,
      };
    }

    return restored;
  }, {});

  return [...comments, ...Object.values(placeholders)];
}

function mapReactions(
  reactions: CommentsWithMessagesModel['messages'][number]['reactions'],
  currentUserId: string | undefined
): CommentReaction[] {
  const grouped = new Map<
    string,
    {
      count: number;
      hasReacted: boolean;
      senders: { id: string; name: string }[];
    }
  >();

  for (const reaction of reactions) {
    const key = reaction.emoji;
    const existing = grouped.get(key) ?? {
      count: 0,
      hasReacted: false,
      senders: [],
    };

    existing.count += 1;
    existing.hasReacted = existing.hasReacted || reaction.sender?.id === currentUserId;

    if (reaction.sender?.id) {
      existing.senders.push({
        id: reaction.sender.id,
        name: reaction.sender.profile?.displayName ?? 'Unknown',
      });
    }

    grouped.set(key, existing);
  }

  return [...grouped.entries()].map(([emoji, data]) => ({
    emoji,
    count: data.count,
    hasReacted: data.hasReacted,
    senders: data.senders,
  }));
}
