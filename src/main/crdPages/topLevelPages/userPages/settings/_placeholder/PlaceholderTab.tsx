import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';

/**
 * Renders a placeholder body for a settings tab whose per-story phase has
 * not yet landed. Used by Foundational-phase routing so all 12 settings
 * URLs resolve correctly even before the per-tab integrations are written.
 */
export const PlaceholderTab = ({ tabLabelKey }: { tabLabelKey: string }) => {
  const { t } = useTranslation('crd-contributorSettings');
  // tabLabelKey is one of the resolved tab labels (e.g. t('shell.tabs.user.account')).
  return (
    <SettingsCard title={tabLabelKey}>
      <p className="text-body text-muted-foreground">{t('shared.loading')}</p>
    </SettingsCard>
  );
};

export default PlaceholderTab;
