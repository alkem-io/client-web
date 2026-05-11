import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useUserSettingsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserSettingsTabView } from '@/crd/components/user/settings/UserSettingsTabView';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import { mapUserSettings, readCrdEnabledLocally, writeCrdEnabledLocally } from './userSettingsMapper';

/**
 * Integration page for the User Settings tab. Two independent toggles:
 *
 * - **Communication & Privacy** (`allowOtherUsersToSendMessages`) — wired
 *   to `updateUserSettings`. Optimistic flip + hard-failure revert with
 *   inline toast (parity with FR-133 / Q5).
 *
 * - **Design System** — writes the viewer's own browser localStorage
 *   (`alkemio-crd-enabled`) and reloads the page (FR-071 / FR-073). Always
 *   reads the LOCAL toggle state, never a server-stored attribute — so a
 *   platform admin viewing another user sees their OWN current setting,
 *   not the target user's.
 */
const CrdUserSettingsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();

  const { data, loading } = useUserSettingsQuery({
    variables: { userID: userId ?? '' },
    skip: !userId,
  });
  const mapped = mapUserSettings(data);

  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const [communicationOverride, setCommunicationOverride] = useState<boolean | null>(null);
  const [communicationSaving, setCommunicationSaving] = useState(false);

  // Resolved value: optimistic override wins until the mutation settles.
  const allowMessages = communicationOverride ?? mapped.allowOtherUsersToSendMessages;

  const onToggleAllowMessages = async (next: boolean) => {
    if (!userId) return;
    setCommunicationOverride(next);
    setCommunicationSaving(true);
    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { communication: { allowOtherUsersToSendMessages: next } },
          },
        },
        refetchQueries: [refetchUserSettingsQuery({ userID: userId })],
        awaitRefetchQueries: true,
      });
      // Server now matches what the user wanted — drop the override so the
      // resolved value flows from the freshly-fetched server value.
      setCommunicationOverride(null);
    } catch {
      // Hard failure → roll back the optimistic flip and surface a toast.
      setCommunicationOverride(null);
      notify(t('user.settings.communication.error'), 'error');
    } finally {
      setCommunicationSaving(false);
    }
  };

  // The CRD toggle is intentionally read every render so the Switch reflects
  // the on-disk value — even if changed in another tab. We don't subscribe to
  // `storage` events because the only path to change it from here is the
  // `onToggleCrdDesign` callback below, which reloads.
  const isCrdEnabled = readCrdEnabledLocally();

  const onToggleCrdDesign = (next: boolean) => {
    writeCrdEnabledLocally(next);
    // Hard reload — the choice between MUI and CRD pages is wired at route
    // mount time via `useCrdEnabled()`, so a reload is the simplest way to
    // re-evaluate the toggle for the entire shell. Per SC-003 this round-trip
    // is expected to complete under 3 s.
    location.reload();
  };

  return (
    <UserSettingsTabView
      loading={loading && !data}
      allowOtherUsersToSendMessages={allowMessages}
      communicationSaving={communicationSaving}
      onToggleAllowMessages={onToggleAllowMessages}
      crdEnabled={isCrdEnabled}
      onToggleCrdDesign={onToggleCrdDesign}
    />
  );
};

export default CrdUserSettingsTab;
