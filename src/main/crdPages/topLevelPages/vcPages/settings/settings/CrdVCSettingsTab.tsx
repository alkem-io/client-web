import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { VCSettingsTabView } from '@/crd/components/virtualContributor/settings/VCSettingsTabView';
import { disableCrdAndNavigate } from '@/main/crdPages/useCrdEnabled';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useVcSettingsTabData from './useVcSettingsTabData';

/**
 * Integration page for the VC Settings tab. Wires `useUrlResolver().vcId` →
 * `useVcSettingsTabData` (engine-conditional sub-section orchestration) →
 * `VCSettingsTabView` (presentational).
 *
 * The cards that render are determined entirely by the data hook (Decision
 * #17 truth table). The view orchestrator only renders cards whose props are
 * present.
 */
const CrdVCSettingsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { vcId } = useUrlResolver();
  const notify = useNotification();
  const data = useVcSettingsTabData({
    vcId,
    onCommitError: () => notify(t('vc.settings.commitErrorToast'), 'error'),
  });

  return (
    <VCSettingsTabView
      loading={data.loading}
      visibility={data.visibility}
      bodyOfKnowledge={
        data.bodyOfKnowledge
          ? { ...data.bodyOfKnowledge, refreshLabel: t('vc.bodyOfKnowledge.refreshLabel') }
          : undefined
      }
      prompt={data.prompt ? { ...data.prompt, helpText: t('vc.prompt.helpText') } : undefined}
      externalConfig={data.externalConfig}
      promptGraphFallback={
        data.promptGraphFallback
          ? (() => {
              const legacyHref = data.promptGraphFallback.legacyHref;
              return {
                heading: t('vc.promptGraphFallback.heading'),
                description: t('vc.promptGraphFallback.description'),
                ctaLabel: t('vc.promptGraphFallback.ctaLabel'),
                onCtaClick: () => disableCrdAndNavigate(legacyHref),
              };
            })()
          : undefined
      }
    />
  );
};

export default CrdVCSettingsTab;
