import type { ClientEvent, RoomEvent } from 'matrix-js-sdk';
import { useEffect, useReducer } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { displayedUnreadCount, useConversationSummaries } from './matrix/conversationSummaryStore';
import { CLIENT_ROOM, CLIENT_SYNC, nativeEntityId } from './matrix/matrixRooms';
import { useUserMessagingContext } from './UserMessagingContext';

// Keep SDK values out of the eager bundle.
const roomListEvents = [
  CLIENT_ROOM as ClientEvent.Room,
  CLIENT_SYNC as ClientEvent.Sync,
  'accountData' as ClientEvent.AccountData,
  'Room.name' as RoomEvent.Name,
  'Room.myMembership' as RoomEvent.MyMembership,
];

export const useNativeConversationRooms = (isEnabled: boolean) => {
  const client = useMatrixClient();
  const [, updateRooms] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    if (!client || !isEnabled) return;
    for (const event of roomListEvents) {
      client.on(event, updateRooms);
    }
    updateRooms();
    return () => {
      for (const event of roomListEvents) {
        client.off(event, updateRooms);
      }
    };
  }, [client, isEnabled]);

  // The platform sync surface currently serves conversation rooms only. Extending
  // it to other room kinds requires a room-kind fact to select conversations here.
  const rooms =
    client && isEnabled
      ? client.getRooms().flatMap(room => {
          const id = nativeEntityId(room.roomId, '!', client);
          return id && room.getMyMembership() === 'join' ? [{ id, room }] : [];
        })
      : [];
  return { client, rooms };
};

export const useUnreadConversationsCount = () => {
  const { isEnabled, selectedRoomId } = useUserMessagingContext();
  const { rooms } = useNativeConversationRooms(isEnabled);
  const roomIds = rooms.map(({ id }) => id);
  const summaries = useConversationSummaries(roomIds);
  return roomIds.filter(roomId => displayedUnreadCount(summaries, roomId, selectedRoomId) > 0).length;
};
