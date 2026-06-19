import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useUserSettingsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateUserSettingsCommunicationInput } from '@/core/apollo/generated/graphql-schema';
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
  const [messagesOverride, setMessagesOverride] = useState<boolean | null>(null);
  const [emailContactOverride, setEmailContactOverride] = useState<boolean | null>(null);
  const [communicationSaving, setCommunicationSaving] = useState(false);

  const allowMessages = messagesOverride ?? mapped.allowOtherUsersToSendMessages;
  const allowEmailContact = emailContactOverride ?? mapped.allowOtherUsersToContactViaEmail;

  const persistCommunication = async (communication: UpdateUserSettingsCommunicationInput, rollback: () => void) => {
    if (!userId) return;
    setCommunicationSaving(true);
    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { communication },
          },
        },
        refetchQueries: [refetchUserSettingsQuery({ userID: userId })],
        awaitRefetchQueries: true,
      });
    } catch {
      notify(t('user.settings.communication.error'), 'error');
    } finally {
      rollback();
      setCommunicationSaving(false);
    }
  };

  const onToggleAllowMessages = async (next: boolean) => {
    setMessagesOverride(next);
    await persistCommunication({ allowOtherUsersToSendMessages: next }, () => setMessagesOverride(null));
  };

  const onToggleAllowEmailContact = async (next: boolean) => {
    setEmailContactOverride(next);
    await persistCommunication({ allowOtherUsersToContactViaEmail: next }, () => setEmailContactOverride(null));
  };

  return (
    <UserSettingsTabView
      loading={loading && !data}
      allowOtherUsersToSendMessages={allowMessages}
      allowOtherUsersToContactViaEmail={allowEmailContact}
      communicationSaving={communicationSaving}
      onToggleAllowMessages={onToggleAllowMessages}
      onToggleAllowEmailContact={onToggleAllowEmailContact}
    />
  );
};

export default CrdUserSettingsTab;
