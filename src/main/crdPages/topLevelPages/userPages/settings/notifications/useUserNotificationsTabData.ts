import { useCallback, useState } from 'react';
import { refetchUserSettingsQuery, useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import type { NotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import { buildNotificationUpdate, type ChannelType, type NotificationGroupId } from './notificationPayloadBuilders';
import { overrideKey } from './userNotificationsMapper';

export type UseUserNotificationsTabDataParams = {
  userId: string | undefined;
  serverSettings: NotificationSettings;
};

export type UseUserNotificationsTabDataResult = {
  /** Map<key, boolean> applied on top of server values for instant UI feedback. */
  overrides: Map<string, boolean>;
  onToggle: (group: NotificationGroupId, property: string, type: ChannelType, next: boolean) => Promise<void>;
};

/**
 * Per-tab data hook for the User Notifications tab.
 *
 * Optimistic-overrides pattern (research §4 / Q5 / FR-064):
 * 1. `onToggle` writes the override into local state immediately → UI flips.
 * 2. Fires `updateUserSettings` with the FULL group payload (preserves
 *    other properties' channels) using the un-overridden server snapshot
 *    as the source of truth.
 * 3. **On success**: refetches `useUserSettingsQuery` and clears that
 *    specific override after the cache resolves.
 * 4. **On hard failure**: rolls back the override (UI snaps back to the
 *    server value) and rejects the returned promise so the integration
 *    page can surface a toast (FR-064 / Q5).
 *
 * Push subscription state lives in `usePushNotificationContext` and is
 * wired separately by the integration page; this hook deals only with
 * the per-row channel toggles.
 */
export const useUserNotificationsTabData = ({
  userId,
  serverSettings,
}: UseUserNotificationsTabDataParams): UseUserNotificationsTabDataResult => {
  const [overrides, setOverrides] = useState<Map<string, boolean>>(() => new Map());
  const [updateUserSettings] = useUpdateUserSettingsMutation();

  const setOverride = useCallback((key: string, value: boolean) => {
    setOverrides(prev => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const clearOverride = useCallback((key: string) => {
    setOverrides(prev => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const onToggle = useCallback(
    async (group: NotificationGroupId, property: string, type: ChannelType, next: boolean) => {
      if (!userId) return;
      const key = overrideKey(group, property, type);
      // 1) Optimistic flip.
      setOverride(key, next);
      try {
        const notification = buildNotificationUpdate(serverSettings, group, property, type, next);
        await updateUserSettings({
          variables: {
            settingsData: { userID: userId, settings: { notification } },
          },
          refetchQueries: [refetchUserSettingsQuery({ userID: userId })],
          awaitRefetchQueries: true,
        });
        // 2) Success → drop the override (server now matches what the user wanted).
        clearOverride(key);
      } catch (err) {
        // 3) Hard failure → rollback + bubble for toast.
        clearOverride(key);
        throw err;
      }
    },
    [userId, serverSettings, updateUserSettings, setOverride, clearOverride]
  );

  return { overrides, onToggle };
};

export default useUserNotificationsTabData;
