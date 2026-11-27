import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { useEffect, useRef, useState } from 'react';
import { useMatrixClient, useMatrixSessionEstablishing } from '@/core/matrix/activeClient';
import { useCallsShown } from '../calls/useCallEligibility';
import { newestEntryId, type ParsedMessage, projectMessages, ringingUntil } from './matrixEvents';
import {
  CLIENT_ROOM,
  CLIENT_SYNC,
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
  /** Where the read marker goes once the thread is seen. */
  readonly readUpToEventId: string | null;
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
 * including reactions and removals. A ring is an entry only in a 1:1
 * conversation: in a group any member could send one, unattributed.
 */
const useConversationTimeline = (alkemioRoomId: string | null, isGroup: boolean): Omit<TimelineState, 'roomKey'> => {
  const client = useMatrixClient();
  const establishing = useMatrixSessionEstablishing();
  const roomKey = client && alkemioRoomId ? alkemioRoomId : null;
  const withCalls = useCallsShown();
  const [state, setState] = useState<TimelineState>({
    roomKey: null,
    messages: [],
    readUpToEventId: null,
    isLoading: false,
  });
  // Read by the subscription's refresh, so showing calls or not re-projects the loaded events in place:
  // loading them again would blank the thread and lose its scroll position.
  const withCallsRef = useRef(withCalls);
  const isGroupRef = useRef(isGroup);
  const refreshRef = useRef<() => void>(undefined);

  useEffect(() => {
    if (!client || !roomKey) {
      return;
    }
    let cancelled = false;
    let loading = true;
    let room: Room | null = null;
    let ringEnd: ReturnType<typeof setTimeout> | undefined;
    const homeserver = homeserverOf(client);

    const refresh = () => {
      if (!cancelled && room) {
        const withCalls = withCallsRef.current;
        const inGroup = isGroupRef.current;
        const events = liveEvents(room);
        const now = Date.now();
        setState({
          roomKey,
          messages: projectMessages(events, homeserver, { withCalls, inGroup, now }),
          readUpToEventId: newestEntryId(events, { withCalls, inGroup, now }),
          isLoading: loading,
        });
        // A ring still ringing shows once it stops, with no further event to say so.
        clearTimeout(ringEnd);
        // Only a 1:1 ring waits to become an entry.
        const until = withCalls && !inGroup ? ringingUntil(events, now) : undefined;
        ringEnd = until === undefined ? undefined : setTimeout(refresh, until - now);
      }
    };
    refreshRef.current = refresh;

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

    let lookupFailed = false;
    const lookUp = () =>
      resolveMatrixRoomId(client, roomKey).then(resolved => {
        if (cancelled) {
          return;
        }
        matrixRoomId = resolved;
        lookupFailed = !resolved;
        room = resolved ? client.getRoom(resolved) : null;
        if (room) {
          void load();
        } else if (!resolved) {
          setState({ roomKey, messages: [], readUpToEventId: null, isLoading: false });
        }
      });
    // A lookup that failed before the first sync (homeserver not yet reachable)
    // left the conversation empty; look it up again now.
    const onSync = (syncState: string) => {
      if (syncState === 'PREPARED' && lookupFailed) {
        lookupFailed = false;
        // Loading again, so the thread does not sit empty and idle while the retry runs.
        setState({ roomKey, messages: [], readUpToEventId: null, isLoading: true });
        void lookUp();
      }
    };

    setState({ roomKey, messages: [], readUpToEventId: null, isLoading: true });
    client.on(ROOM_TIMELINE as never, onTimeline as never);
    client.on(ROOM_REDACTION as never, onTimeline as never);
    client.on(ROOM_LOCAL_ECHO_UPDATED as never, onLocalEcho as never);
    client.on(ROOM_TIMELINE_RESET as never, onReset as never);
    client.on(CLIENT_ROOM as never, onRoom as never);
    client.on(CLIENT_SYNC as never, onSync as never);

    void lookUp();

    return () => {
      cancelled = true;
      clearTimeout(ringEnd);
      client.removeListener(ROOM_TIMELINE as never, onTimeline as never);
      client.removeListener(ROOM_REDACTION as never, onTimeline as never);
      client.removeListener(ROOM_LOCAL_ECHO_UPDATED as never, onLocalEcho as never);
      client.removeListener(ROOM_TIMELINE_RESET as never, onReset as never);
      client.removeListener(CLIENT_ROOM as never, onRoom as never);
      client.removeListener(CLIENT_SYNC as never, onSync as never);
    };
  }, [client, roomKey]);

  useEffect(() => {
    withCallsRef.current = withCalls;
    isGroupRef.current = isGroup;
    refreshRef.current?.();
  }, [withCalls, isGroup]);

  if (!client) {
    // Without a client the thread waits only while the session is being established
    // (silent sign-in can take a while); not configured or failed shows the empty state.
    return { messages: [], readUpToEventId: null, isLoading: Boolean(alkemioRoomId) && establishing };
  }
  if (state.roomKey !== roomKey) {
    return { messages: [], readUpToEventId: null, isLoading: Boolean(roomKey) };
  }
  return { messages: state.messages, readUpToEventId: state.readUpToEventId, isLoading: state.isLoading };
};

export { HISTORY_DEPTH, useConversationTimeline };
