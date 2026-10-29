import { useEffect, useRef } from 'react';
import { useUserConversationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoomType, type UserDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { playSound } from '@/core/sound/soundPlayer';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { shouldPlayChatSound } from '../shouldPlayChatSound';
import { useUserMessagingContext } from '../UserMessagingContext';
import { isCallsConfigured } from './callConfig';
import { setIncomingCallRooms } from './incomingCallStore';
import { useActiveCallRooms } from './useActiveCallRooms';
import { type CallableConversation, isBetaTester } from './useCallEligibility';

/**
 * Watches every callable conversation of the user, with the chat panel closed
 * too, for calls the user is not in. Publishes them for the unread signals and
 * plays the chat sound when such a call starts, with the chat-sound rules: not
 * for the conversation being viewed in a focused tab, and only when the user's
 * chat-sound setting is on.
 */
export const useIncomingCallsWatcher = () => {
  const { isEnabled, selectedRoomId } = useUserMessagingContext();
  const { userModel, platformRoles } = useCurrentUserContext();
  const chatSoundEnabled =
    (userModel as UserDetailsFragment | undefined)?.settings?.notification?.sound?.chatMessage ?? true;
  const enabled = isEnabled && isBetaTester(platformRoles) && isCallsConfigured();

  const { data } = useUserConversationsUnreadCountQuery({ skip: !enabled, fetchPolicy: 'cache-first' });
  const conversations: CallableConversation[] = (data?.me?.conversations?.conversations ?? []).flatMap(conv =>
    conv.room
      ? [
          {
            roomId: conv.room.id,
            isGroup: conv.room.type === RoomType.ConversationGroup,
            // The guidance conversation is a chat with a virtual contributor, which is never callable.
            isGuidance: false,
            members: conv.members,
          },
        ]
      : []
  );

  // Read when a call starts; synced post-commit.
  const selectedRoomIdRef = useRef(selectedRoomId);
  const chatSoundEnabledRef = useRef(chatSoundEnabled);
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
    chatSoundEnabledRef.current = chatSoundEnabled;
  }, [selectedRoomId, chatSoundEnabled]);

  const incoming = useActiveCallRooms(enabled ? conversations : [], {
    withoutMe: true,
    onStarted: started => {
      const hasFocus = document.hasFocus();
      const audible = started.some(roomId =>
        shouldPlayChatSound({
          isOwnMessage: false,
          isViewing: roomId === selectedRoomIdRef.current,
          hasFocus,
          enabled: chatSoundEnabledRef.current,
        })
      );
      if (audible) {
        playSound('chat');
      }
    },
  });

  useEffect(() => {
    setIncomingCallRooms(incoming);
  }, [incoming]);
};
