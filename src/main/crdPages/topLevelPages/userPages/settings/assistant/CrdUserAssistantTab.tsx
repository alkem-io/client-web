import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { usePlatformCapabilitiesQuery, useUserAssistantSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserAssistantTabView } from '@/crd/components/user/settings/UserAssistantTabView';
import { useAssistantEnabled } from '@/main/assistant/useAssistantEnabled';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import { mapAssistantCapabilities, type PlatformCapability } from './assistantCapabilitiesMapper';
import useUserAssistantTabData from './useUserAssistantTabData';

/**
 * Integration page for the User → Settings → Assistant tab (US4 / FR-018).
 *
 * Wires:
 * - `usePlatformCapabilitiesQuery` — the **dynamic** tool surface; the toggle
 *   list is enumerated from this, never a hardcoded enum (FR-006).
 * - `useUserAssistantSettingsQuery` — the user's current `enabledCapabilities`
 *   grant.
 * - `useUserAssistantTabData` — optimistic toggle + persist via
 *   `updateUserSettings({ assistant })`, with revert on hard failure.
 *
 * Gated behind the same auth + assistant feature flag as the panel
 * (`useAssistantEnabled`); when off, the route redirects to the profile tab so
 * the tab is never reachable while the feature ships OFF.
 */
const CrdUserAssistantTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const isAssistantEnabled = useAssistantEnabled();
  const { userId, profileUrl } = useUserPageRouteContext();

  const { data: capabilitiesData, loading: capabilitiesLoading } = usePlatformCapabilitiesQuery({
    skip: !isAssistantEnabled,
    fetchPolicy: 'cache-and-network',
  });

  const { data: settingsData, loading: settingsLoading } = useUserAssistantSettingsQuery({
    variables: { userId: userId ?? '' },
    skip: !isAssistantEnabled || !userId,
    fetchPolicy: 'cache-and-network',
  });

  const capabilities: PlatformCapability[] = capabilitiesData?.platformCapabilities ?? [];
  const storedToggles = settingsData?.user.settings.assistant.enabledCapabilities ?? [];

  const { overrides, onToggle } = useUserAssistantTabData({ userId, capabilities, storedToggles });

  const rows = mapAssistantCapabilities(capabilities, storedToggles, overrides);

  const handleToggle = async (capabilityName: string, next: boolean) => {
    try {
      await onToggle(capabilityName, next);
    } catch {
      notify(t('user.assistant.toggleError'), 'error');
    }
  };

  // Feature flag OFF → the tab is not exposed; bounce to the profile tab.
  if (!isAssistantEnabled) {
    return <Navigate to={profileUrl ? `${profileUrl}/settings/profile` : '..'} replace={true} />;
  }

  const loading = (capabilitiesLoading && !capabilitiesData) || (settingsLoading && !settingsData);

  return <UserAssistantTabView loading={loading} capabilities={rows} onToggle={handleToggle} />;
};

export default CrdUserAssistantTab;
