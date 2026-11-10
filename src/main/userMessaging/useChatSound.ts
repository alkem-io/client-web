import { useEffect, useSyncExternalStore } from 'react';
import { refetchUserSettingsQuery, useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import type { UserDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildSoundUpdate } from '@/main/crdPages/topLevelPages/userPages/settings/notifications/notificationPayloadBuilders';
import {
  copySavedChatSoundToStorage,
  readStoredChatSound,
  subscribeToStoredChatSound,
  writeStoredChatSound,
} from './chatSoundPreference';

/**
 * Whether the chat sound is on for the current user, and the only place that
 * decides it: the value shared between tabs when there is one, else the saved
 * user setting, else on. Also keeps the shared value in step with the saved
 * setting as this tab loads it or sees it change (e.g. from the settings page).
 */
export const useChatSoundEnabled = () => {
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;
  const savedEnabled = (userModel as UserDetailsFragment | undefined)?.settings?.notification?.sound?.chatMessage;
  const storedEnabled = useSyncExternalStore(subscribeToStoredChatSound, () =>
    userId ? readStoredChatSound(userId) : undefined
  );

  useEffect(() => {
    if (userId && savedEnabled !== undefined) {
      copySavedChatSoundToStorage(userId, savedEnabled);
    }
  }, [userId, savedEnabled]);

  return storedEnabled ?? savedEnabled ?? true;
};

/**
 * The chat sound state plus the way to change it from the chat itself.
 * `setEnabled` is undefined for a visitor who is not signed in.
 */
export const useChatSound = () => {
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;
  const enabled = useChatSoundEnabled();
  const [updateUserSettings] = useUpdateUserSettingsMutation();

  /** Applies the change in every tab at once, then saves it; a failed save is undone and rejects. */
  const setEnabled = async (next: boolean) => {
    if (!userId) {
      return;
    }
    writeStoredChatSound(userId, next);
    try {
      await updateUserSettings({
        variables: { settingsData: { userID: userId, settings: buildSoundUpdate('chatMessage', next) } },
        // The mutation's own response has no sound fields, so writing it to the cache would
        // drop them from the cached settings. The refetch writes the complete settings instead,
        // which is what both the settings page and the current-user reader of the setting see.
        fetchPolicy: 'no-cache',
        refetchQueries: [refetchUserSettingsQuery({ userID: userId })],
        // The caller reports the failure, so the global handler must not report it too.
        context: { skipGlobalErrorHandler: true },
      });
    } catch (error) {
      // Leave a newer change alone, whether made here or in another tab.
      if (readStoredChatSound(userId) === next) {
        writeStoredChatSound(userId, enabled);
      }
      throw error;
    }
  };

  return { enabled, setEnabled: userId ? setEnabled : undefined };
};
