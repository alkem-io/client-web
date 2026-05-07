import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';

/**
 * Renders a placeholder body for an Org settings tab whose per-story phase
 * has not yet landed. Used by Foundational-phase routing so all 5 Org
 * settings URLs resolve correctly.
 */
export const PlaceholderTab = ({ tabLabelKey }: { tabLabelKey: string }) => {
  const { t } = useTranslation('crd-contributorSettings');
  return (
    <SettingsCard title={tabLabelKey}>
      <p className="text-body text-muted-foreground">{t('shared.loading')}</p>
    </SettingsCard>
  );
};

export default PlaceholderTab;
