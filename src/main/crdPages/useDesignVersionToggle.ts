import { useTranslation } from 'react-i18next';
import { useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { info as logInfo, TagCategoryValues } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { DESIGN_VERSION_NEW, DESIGN_VERSION_OLD, useCrdEnabled, writeDesignVersionToStorage } from './useCrdEnabled';

export type DesignVersionToggleState =
  | { isVisible: false }
  | {
      isVisible: true;
      enabled: boolean;
      isPending: boolean;
      onChange: (next: boolean) => Promise<void>;
    };

export function useDesignVersionToggle(): DesignVersionToggleState {
  const { userModel, isAuthenticated, loadingMe } = useCurrentUserContext();
  const enabled = useCrdEnabled();
  const notify = useNotification();
  const { t } = useTranslation();
  const [updateUserSettings, { loading: isPending }] = useUpdateUserSettingsMutation();

  const userID = userModel?.id;

  if (!isAuthenticated || loadingMe || !userID) {
    return { isVisible: false };
  }

  const onChange = async (next: boolean) => {
    const version = next ? DESIGN_VERSION_NEW : DESIGN_VERSION_OLD;
    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID,
            settings: { designVersion: version },
          },
        },
      });
      writeDesignVersionToStorage(version);
      logInfo(`Design version changed to ${version}`, {
        label: 'DESIGN_VERSION_SWITCH',
        category: TagCategoryValues.UI,
      });
      window.location.reload();
    } catch {
      notify(t('topBar.designVersion.errorSaving'), 'error');
    }
  };

  return { isVisible: true, enabled, isPending, onChange };
}
