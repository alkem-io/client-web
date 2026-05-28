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
import { mapUserSettings } from './userSettingsMapper';

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
      setCommunicationOverride(null);
    } catch {
      setCommunicationOverride(null);
      notify(t('user.settings.communication.error'), 'error');
    } finally {
      setCommunicationSaving(false);
    }
  };

  return (
    <UserSettingsTabView
      loading={loading && !data}
      allowOtherUsersToSendMessages={allowMessages}
      communicationSaving={communicationSaving}
      onToggleAllowMessages={onToggleAllowMessages}
    />
  );
};

export default CrdUserSettingsTab;
