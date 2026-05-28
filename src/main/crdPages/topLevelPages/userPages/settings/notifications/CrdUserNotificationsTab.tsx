import { useTranslation } from 'react-i18next';
import { useUserSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserNotificationsTabView } from '@/crd/components/user/settings/UserNotificationsTabView';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { usePushNotificationContext } from '@/main/pushNotifications/PushNotificationProvider';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import { extractServerSettings, mapUserNotifications, type NotificationPrivileges } from './userNotificationsMapper';
import useUserNotificationsTabData from './useUserNotificationsTabData';

/**
 * Integration page for the User Notifications tab. Wires:
 * - `useUserSettingsQuery` (server settings — un-overridden snapshot used by
 *   the payload builder).
 * - `usePushNotificationContext` (push availability + subscribe/unsubscribe
 *   for the master toggle).
 * - `useCurrentUserContext` (privileges that gate Space Admin / Platform
 *   Admin / Organization groups).
 * - `useUserNotificationsTabData` (optimistic-overrides + onToggle with
 *   hard-failure revert per FR-064 / Q5).
 *
 * On hard failure the hook re-throws; this page catches and surfaces an
 * error toast. The failed channel snaps back to the server value because
 * the override has already been cleared by the hook.
 */
const CrdUserNotificationsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();
  const { platformPrivilegeWrapper } = useCurrentUserContext();

  const {
    isSupported: isPushSupported,
    isServerEnabled: isPushServerEnabled,
    permissionState: pushPermissionState,
    isSubscribed: isPushSubscribed,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe,
    loading: pushLoading,
    requiresPWAMode,
    isPrivateBrowsing,
  } = usePushNotificationContext();

  const isPushAvailable =
    Boolean(isPushSupported) && Boolean(isPushServerEnabled) && !requiresPWAMode && !isPrivateBrowsing;

  const { data, loading } = useUserSettingsQuery({
    variables: { userID: userId ?? '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const serverSettings = extractServerSettings(data);

  const privileges: NotificationPrivileges = {
    isPlatformAdmin: platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false,
    isOrganizationAdmin:
      platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsOrganizationAdmin) ??
      false,
    isSpaceAdmin:
      platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsSpaceAdmin) ?? false,
    isSpaceLead:
      platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReceiveNotificationsSpaceLead) ?? false,
  };

  const { overrides, onToggle } = useUserNotificationsTabData({ userId, serverSettings });

  const { groups } = mapUserNotifications(serverSettings, overrides, privileges, t);

  const handleToggle = async (
    groupId: string,
    property: string,
    channel: 'inApp' | 'email' | 'push',
    next: boolean
  ) => {
    try {
      // The view passes the groupId as a plain string; cast to the union the
      // hook expects. The mapper produced these ids so they're guaranteed valid.
      await onToggle(groupId as Parameters<typeof onToggle>[0], property, channel, next);
    } catch {
      notify(t('user.notifications.toggleError'), 'error');
    }
  };

  const handlePushMasterToggle = async () => {
    try {
      if (isPushSubscribed) {
        await pushUnsubscribe();
      } else {
        await pushSubscribe();
      }
    } catch {
      notify(t('user.notifications.push.error'), 'error');
    }
  };

  return (
    <UserNotificationsTabView
      loading={loading && !data}
      pushAvailable={isPushAvailable}
      pushSubscribed={Boolean(isPushSubscribed)}
      pushLoading={Boolean(pushLoading)}
      pushPermissionDenied={pushPermissionState === 'denied'}
      pushRequiresPwa={Boolean(requiresPWAMode)}
      onPushMasterToggle={handlePushMasterToggle}
      groups={groups}
      onToggle={handleToggle}
    />
  );
};

export default CrdUserNotificationsTab;
