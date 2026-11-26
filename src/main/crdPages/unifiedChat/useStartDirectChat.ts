import type { EventType, MatrixClient } from 'matrix-js-sdk';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { nativeEntityId, nativeMatrixId } from '@/main/userMessaging/matrix/matrixRooms';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

export type StartDirectChatResult = {
  conversationId: string;
  roomId: string;
};

export async function openNativeConversation(
  client: MatrixClient | null,
  inviteeIds: readonly string[],
  name?: string
): Promise<string> {
  if (!client) {
    throw new Error('Messaging is not connected.');
  }

  const invite = inviteeIds.map(id => {
    const userId = nativeMatrixId(id, '@', client);
    if (!userId) {
      throw new Error('Invalid conversation recipient.');
    }
    return userId;
  });
  const isDirect = invite.length === 1;

  const existingDirectRoom = () => {
    if (!isDirect) {
      return;
    }
    const direct: Record<string, unknown> | undefined = client
      .getAccountData('m.direct' as EventType.Direct)
      ?.getContent();
    const rooms = direct?.[invite[0]];
    if (Array.isArray(rooms)) {
      for (const room of rooms) {
        const id = typeof room === 'string' ? nativeEntityId(room, '!', client) : undefined;
        if (id) {
          return id;
        }
      }
    }
  };

  const existing = existingDirectRoom();
  if (existing) {
    return existing;
  }

  let created: Awaited<ReturnType<MatrixClient['createRoom']>>;
  try {
    created = await client.createRoom({
      is_direct: isDirect,
      invite,
      ...(isDirect ? {} : { name }),
    });
  } catch (error) {
    // A sync may have delivered the direct room during a competing create.
    const concurrentRoom = existingDirectRoom();
    if (concurrentRoom) {
      return concurrentRoom;
    }
    throw error;
  }

  const roomId = nativeEntityId(created.room_id, '!', client);
  if (!roomId) {
    throw new Error('Conversation could not be opened.');
  }
  return roomId;
}

/** Opens the recipient’s direct conversation in the existing chat panel. */
export const useStartDirectChat = (userId: string | undefined) => {
  const client = useMatrixClient();
  const { setIsOpen, setSelectedConversationId, setSelectedRoomId, setNewlyCreatedConversationId } =
    useUserMessagingContext();

  const startDirectChat = async (targetUserId: string | undefined = userId): Promise<StartDirectChatResult> => {
    if (!targetUserId) {
      throw new Error('Recipient user not loaded.');
    }

    const roomId = await openNativeConversation(client, [targetUserId]);
    setNewlyCreatedConversationId(roomId);
    setSelectedConversationId(roomId);
    setSelectedRoomId(roomId);
    setIsOpen(true);

    return { conversationId: roomId, roomId };
  };

  return { startDirectChat };
};
