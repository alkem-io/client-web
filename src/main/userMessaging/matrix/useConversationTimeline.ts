import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { useEffect, useState } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { type ParsedMessage, projectMessages } from './matrixEvents';
import {
  CLIENT_ROOM,
  homeserverOf,
  liveEvents,
  ROOM_LOCAL_ECHO_UPDATED,
  ROOM_REDACTION,
  ROOM_TIMELINE,
  resolveMatrixRoomId,
} from './matrixRooms';

// The GraphQL history this replaces returned the room's last 1,000 events;
// the open conversation is paged back to the same depth, and no further.
const HISTORY_DEPTH = 1000;
const PAGE_SIZE = 100;
const ROOM_TIMELINE_RESET = 'Room.timelineReset';

type TimelineState = {
  readonly roomKey: string | null;
  readonly messages: ParsedMessage[];
  readonly isLoading: boolean;
};

const backfill = async (client: MatrixClient, room: Room, isCancelled: () => boolean, onPage: () => void) => {
  while (!isCancelled()) {
    const loaded = room.getLiveTimeline().getEvents().length;
    if (loaded >= HISTORY_DEPTH) {
      return;
    }
    await client.scrollback(room, Math.min(PAGE_SIZE, HISTORY_DEPTH - loaded));
    if (room.getLiveTimeline().getEvents().length === loaded) {
      return; // the start of the room
    }
    onPage();
  }
};

/**
 * The open conversation's messages, read from sync: the room is paged back
 * to today's history depth when opened, then follows the live timeline,
 * including reactions and removals.
 */
const useConversationTimeline = (alkemioRoomId: string | null): { messages: ParsedMessage[]; isLoading: boolean } => {
  const client = useMatrixClient();
  const roomKey = client && alkemioRoomId ? alkemioRoomId : null;
  const [state, setState] = useState<TimelineState>({ roomKey: null, messages: [], isLoading: false });

  useEffect(() => {
    if (!client || !roomKey) {
      return;
    }
    let cancelled = false;
    let loading = true;
    let room: Room | null = null;
    const homeserver = homeserverOf(client);

    const refresh = () => {
      if (!cancelled && room) {
        setState({ roomKey, messages: projectMessages(liveEvents(room), homeserver), isLoading: loading });
      }
    };

    // Re-projects once per page rather than once per paginated event.
    const load = async () => {
      if (!room) {
        return;
      }
      loading = true;
      refresh();
      try {
        await backfill(client, room, () => cancelled, refresh);
      } catch {
        // A failed page leaves the history at the depth already loaded.
      } finally {
        loading = false;
        refresh();
      }
    };

    const onTimeline = (_event: MatrixEvent, eventRoom: Room | undefined, toStartOfTimeline?: boolean) => {
      if (room && eventRoom?.roomId === room.roomId && !toStartOfTimeline) {
        refresh();
      }
    };
    // A sent event swaps its temporary id for the server's without a timeline event.
    const onLocalEcho = (_event: MatrixEvent, echoRoom: Room) => onTimeline(_event, echoRoom);
    // A gap in sync replaces the live timeline; page it back to depth again.
    const onReset = (resetRoom: Room | undefined) => {
      if (room && resetRoom?.roomId === room.roomId) {
        void load();
      }
    };
    let matrixRoomId: string | null = null;
    const onRoom = (newRoom: Room) => {
      if (!room && newRoom.roomId === matrixRoomId) {
        room = newRoom;
        void load();
      }
    };

    setState({ roomKey, messages: [], isLoading: true });
    client.on(ROOM_TIMELINE as never, onTimeline as never);
    client.on(ROOM_REDACTION as never, onTimeline as never);
    client.on(ROOM_LOCAL_ECHO_UPDATED as never, onLocalEcho as never);
    client.on(ROOM_TIMELINE_RESET as never, onReset as never);
    client.on(CLIENT_ROOM as never, onRoom as never);

    void resolveMatrixRoomId(client, roomKey).then(resolved => {
      if (cancelled) {
        return;
      }
      matrixRoomId = resolved;
      room = resolved ? client.getRoom(resolved) : null;
      if (room) {
        void load();
      } else if (!resolved) {
        setState({ roomKey, messages: [], isLoading: false });
      }
    });

    return () => {
      cancelled = true;
      client.removeListener(ROOM_TIMELINE as never, onTimeline as never);
      client.removeListener(ROOM_REDACTION as never, onTimeline as never);
      client.removeListener(ROOM_LOCAL_ECHO_UPDATED as never, onLocalEcho as never);
      client.removeListener(ROOM_TIMELINE_RESET as never, onReset as never);
      client.removeListener(CLIENT_ROOM as never, onRoom as never);
    };
  }, [client, roomKey]);

  if (state.roomKey !== roomKey) {
    return { messages: [], isLoading: Boolean(roomKey) };
  }
  return { messages: state.messages, isLoading: state.isLoading };
};

export { HISTORY_DEPTH, useConversationTimeline };
