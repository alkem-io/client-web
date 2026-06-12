import type { TFunction } from 'i18next';
import { ActorType, AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { CommentData, CommentReaction } from '@/crd/components/comment/types';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';

type RoomWithMessages = Pick<CommentsWithMessagesModel, 'messages' | 'authorization'>;

type MapRoomToCommentDataOptions = {
  currentUserId?: string;
  /** `t` from `useTranslation()` (default `translation` namespace). Required —
   *  the mapper now pre-formats `timestamp` into a relative "X minutes ago"
   *  string via `common.time.long.*` so the CRD component can render it
   *  as-is. Pass `tMain` (typed against `translation`) from the consumer. */
  t: TFunction;
};

export function mapRoomToCommentData(
  room: RoomWithMessages | undefined,
  options: MapRoomToCommentDataOptions
): CommentData[] {
  if (!room) {
    return [];
  }

  const { currentUserId, t } = options;
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
        profileUrl: message.sender?.profile?.url,
        isVirtualContributor: message.sender?.type === ActorType.VirtualContributor,
      },
      content: message.message,
      timestamp: formatTimeElapsed(new Date(message.timestamp), t, 'long'),
      timestampMs: message.timestamp,
      parentId: message.threadID,
      reactions: mapReactions(message.reactions, currentUserId),
      canDelete,
    };
  });

  // Track the raw epoch ms of each placeholder so we can compare ages with
  // `message.timestamp` (also epoch ms). Comparing on `existing.timestamp`
  // no longer works — it is now a pre-formatted display string, not a date.
  const placeholderRawTimestamps = new Map<string, number>();

  const placeholders = room.messages.reduce<Record<string, CommentData>>((restored, message) => {
    const parentId = message.threadID;

    if (!parentId || messageIds.has(parentId)) {
      return restored;
    }

    const existing = restored[parentId];
    const formattedTimestamp = formatTimeElapsed(new Date(message.timestamp), t, 'long');

    if (!existing) {
      restored[parentId] = {
        id: parentId,
        author: {
          id: 'deleted',
          name: 'Deleted user',
        },
        content: '',
        timestamp: formattedTimestamp,
        timestampMs: message.timestamp,
        reactions: [],
        canDelete: false,
        isDeleted: true,
      };
      placeholderRawTimestamps.set(parentId, message.timestamp);
    } else if ((placeholderRawTimestamps.get(parentId) ?? Number.POSITIVE_INFINITY) > message.timestamp) {
      restored[parentId] = {
        ...existing,
        timestamp: formattedTimestamp,
        timestampMs: message.timestamp,
      };
      placeholderRawTimestamps.set(parentId, message.timestamp);
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
