import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { useCrdRoomComments } from '@/main/crdPages/space/hooks/useCrdRoomComments';

type DiscussionCommentsConnectorProps = {
  roomId: string;
  room: Pick<CommentsWithMessagesModel, 'messages' | 'authorization'> | undefined;
};

export function DiscussionCommentsConnector({ roomId, room }: DiscussionCommentsConnectorProps) {
  const { thread, commentInput } = useCrdRoomComments({ roomId, room });

  return (
    <div className="space-y-4">
      {thread}
      {commentInput}
    </div>
  );
}
