import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { useCrdRoomComments } from '@/main/crdPages/space/hooks/useCrdRoomComments';
import { useOpenDirectChatHandler } from '@/main/crdPages/topLevelPages/common/useSendMessageHandler';

type DiscussionCommentsConnectorProps = {
  roomId: string;
  room: Pick<CommentsWithMessagesModel, 'messages' | 'authorization'> | undefined;
};

export function DiscussionCommentsConnector({ roomId, room }: DiscussionCommentsConnectorProps) {
  const { onOpenChat } = useOpenDirectChatHandler({ recipientUserId: undefined });
  const { thread, commentInput } = useCrdRoomComments({
    roomId,
    room,
    onMessageContributor: contributor => void onOpenChat(contributor.id),
  });

  return (
    <div className="space-y-4">
      {thread}
      {commentInput}
    </div>
  );
}
