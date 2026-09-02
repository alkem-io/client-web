import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useUserSettingsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  CurrentUserLightQuery,
  UpdateUserSettingsCommunicationInput,
} from '@/core/apollo/generated/graphql-schema';
// Do not import the i18n singleton directly — it runs side-effects on import
// that break tests. Use i18nInstance from useTranslation() instead.
// supportedLngs is pulled from i18nInstance.options.supportedLngs at runtime.
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserSettingsTabView } from '@/crd/components/user/settings/UserSettingsTabView';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import { mapUserSettings } from './userSettingsMapper';

const CrdUserSettingsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();

  const { language: languageConfig } = useConfig();
  const platformDefault = languageConfig?.default ?? 'en';

  const { data, loading } = useUserSettingsQuery({
    variables: { userID: userId ?? '' },
    skip: !userId,
  });
  const mapped = mapUserSettings(data);

  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const [messagesOverride, setMessagesOverride] = useState<boolean | null>(null);
  // Email-contact toggle temporarily disabled client-side (chat-only).
  // const [emailContactOverride, setEmailContactOverride] = useState<boolean | null>(null);
  const [communicationSaving, setCommunicationSaving] = useState(false);

  const allowMessages = messagesOverride ?? mapped.allowOtherUsersToSendMessages;

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

  // ── Language (T011 — FR-011/FR-017) ──────────────────────────────────
  // Current effective language: account setting (from CurrentUserLight, which includes language)
  // ?? platform default. Cast to the CurrentUserLightQuery user shape (T001).
  const { userModel } = useCurrentUserContext();
  type CurrentUser = NonNullable<CurrentUserLightQuery['me']['user']>;
  const userDetails = userModel as CurrentUser | undefined;
  const accountLanguage = userDetails?.settings?.language ?? null;
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageOverride, setLanguageOverride] = useState<string | null>(null);
  const currentLanguage = languageOverride ?? accountLanguage ?? platformDefault;

  // Full supported set (not just eligible — FR-017).
  // Pull supportedLngs from the i18next instance options to avoid importing the
  // config singleton (which has side-effects that break unit tests).
  const { i18n: i18nInstance } = useTranslation();
  const supportedLngsRaw: string[] = Array.isArray(i18nInstance.options.supportedLngs)
    ? (i18nInstance.options.supportedLngs as string[])
    : [];
  const availableLanguages = supportedLngsRaw
    .filter(lng => lng !== 'inContextTool' && lng !== 'cimode')
    // biome-ignore lint/suspicious/noExplicitAny: dynamic key — lng is a supported language code
    .map(lng => ({ code: lng, label: String((i18nInstance as any).t(`languages.${lng}`)) }));

  const onLanguageChange = async (languageCode: string) => {
    if (!userId) return;
    setLanguageOverride(languageCode);
    setLanguageSaving(true);
    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { language: languageCode },
          },
        },
        refetchQueries: [refetchUserSettingsQuery({ userID: userId })],
        awaitRefetchQueries: true,
      });
      // Apply immediately (FR-011). Use the i18n instance from useTranslation()
      // to avoid importing the config singleton (side-effects in tests).
      void i18nInstance.changeLanguage(languageCode);
    } catch {
      notify(t('user.settings.language.error'), 'error');
      // Revert the optimistic override on error.
      setLanguageOverride(null);
    } finally {
      setLanguageSaving(false);
    }
  };

  return (
    <UserSettingsTabView
      loading={loading && !data}
      allowOtherUsersToSendMessages={allowMessages}
      communicationSaving={communicationSaving}
      onToggleAllowMessages={onToggleAllowMessages}
      currentLanguage={currentLanguage}
      availableLanguages={availableLanguages}
      languageSaving={languageSaving}
      onLanguageChange={onLanguageChange}
    />
  );
};

export default CrdUserSettingsTab;
