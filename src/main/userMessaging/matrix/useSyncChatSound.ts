import type { MatrixEvent, Room } from 'matrix-js-sdk';
import { useEffect, useRef } from 'react';
import type { UserDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { playSound } from '@/core/sound/soundPlayer';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isCallsConfigured } from '../calls/callConfig';
import { isBetaTester } from '../calls/useCallEligibility';
import { shouldPlayChatSound } from '../shouldPlayChatSound';
import { useUserMessagingContext } from '../UserMessagingContext';
import { storeFor } from './conversationSummaryStore';
import { isMessageLike } from './matrixEvents';
import { CLIENT_SYNC, ROOM_TIMELINE } from './matrixRooms';

// Sent once by whoever joins an empty call: `ring` for a 1:1 call, `notification` for a group call.
const CALL_STARTED_EVENT_TYPES = new Set(['org.matrix.msc4075.rtc.notification', 'org.matrix.msc4075.call.notify']);

/**
 * Plays the chat sound for a new message arriving by sync in one of the
 * user's conversations, with the same rules as before: not for own messages,
 * not for the conversation being viewed in a focused tab, and only when the
 * user's chat-sound setting is on. The initial sync backlog never sounds.
 * A call starting sounds the same way, for those who see the call controls.
 */
export const useSyncChatSound = () => {
  const client = useMatrixClient();
  const { selectedRoomId } = useUserMessagingContext();
  const { userModel, platformRoles } = useCurrentUserContext();
  const callsShown = isBetaTester(platformRoles) && isCallsConfigured();
  const chatSoundEnabled =
    (userModel as UserDetailsFragment | undefined)?.settings?.notification?.sound?.chatMessage ?? true;

  // Read inside client callbacks; synced post-commit.
  const selectedRoomIdRef = useRef(selectedRoomId);
  const chatSoundEnabledRef = useRef(chatSoundEnabled);
  const callsShownRef = useRef(callsShown);
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
    chatSoundEnabledRef.current = chatSoundEnabled;
    callsShownRef.current = callsShown;
  }, [selectedRoomId, chatSoundEnabled, callsShown]);

  useEffect(() => {
    if (!client) {
      return;
    }
    const store = storeFor(client);
    let live = client.isInitialSyncComplete();

    const onSync = (state: string) => {
      if (state === 'PREPARED') {
        live = true;
      }
    };
    const onTimeline = (
      event: MatrixEvent,
      room: Room | undefined,
      toStartOfTimeline: boolean,
      _removed: boolean,
      data: { liveEvent?: boolean } | undefined
    ) => {
      const type = event.getType();
      const isCallStarted = CALL_STARTED_EVENT_TYPES.has(type) && callsShownRef.current;
      if (!live || toStartOfTimeline || !room || !data?.liveEvent || !(isMessageLike(type) || isCallStarted)) {
        return;
      }
      const alkemioRoomId = store.alkemioRoomIdFor(room.roomId);
      if (!alkemioRoomId) {
        return;
      }
      if (
        shouldPlayChatSound({
          isOwnMessage: event.getSender() === client.getUserId(),
          isViewing: alkemioRoomId === selectedRoomIdRef.current,
          hasFocus: document.hasFocus(),
          enabled: chatSoundEnabledRef.current,
        })
      ) {
        playSound('chat');
      }
    };

    client.on(CLIENT_SYNC as never, onSync as never);
    client.on(ROOM_TIMELINE as never, onTimeline as never);
    return () => {
      client.removeListener(CLIENT_SYNC as never, onSync as never);
      client.removeListener(ROOM_TIMELINE as never, onTimeline as never);
    };
  }, [client]);
};
