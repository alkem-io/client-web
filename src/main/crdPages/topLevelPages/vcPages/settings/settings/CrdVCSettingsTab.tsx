import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { VCSettingsTabView } from '@/crd/components/virtualContributor/settings/VCSettingsTabView';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { MarkdownUploadScope } from '@/main/crdPages/markdown/MarkdownUploadScope';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useVcSettingsTabData from './useVcSettingsTabData';

/**
 * Integration page for the VC Settings tab. Wires `useUrlResolver().vcId` →
 * `useVcSettingsTabData` (engine-conditional sub-section orchestration) →
 * `VCSettingsTabView` (presentational).
 *
 * The settings shell mounts no ambient `StorageConfigContextProvider`, so
 * `MarkdownUploadScope` mounts a `virtualContributor`-scoped one (the
 * system-prompt editor is always EDIT mode → `temporaryLocation: false`) and
 * yields the upload wiring; before the id resolves it yields `undefined`.
 *
 * The cards that render are determined entirely by the data hook (Decision
 * #17 truth table). The view orchestrator only renders cards whose props are
 * present.
 */
const CrdVCSettingsTab = () => {
  const { vcId } = useUrlResolver();
  return (
    <MarkdownUploadScope
      storage={vcId ? { locationType: 'virtualContributor', virtualContributorId: vcId } : undefined}
    >
      {markdownUpload => <CrdVCSettingsTabBody markdownUpload={markdownUpload} />}
    </MarkdownUploadScope>
  );
};

const CrdVCSettingsTabBody = ({ markdownUpload }: { markdownUpload?: MarkdownUploadProps }) => {
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
      prompt={data.prompt ? { ...data.prompt, helpText: t('vc.prompt.helpText'), ...markdownUpload } : undefined}
      externalConfig={data.externalConfig}
    />
  );
};

export default CrdVCSettingsTab;
