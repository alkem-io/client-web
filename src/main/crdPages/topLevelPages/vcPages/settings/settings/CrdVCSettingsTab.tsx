import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { VCSettingsTabView } from '@/crd/components/virtualContributor/settings/VCSettingsTabView';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useVcSettingsTabData from './useVcSettingsTabData';

/**
 * Integration page for the VC Settings tab. Wires `useUrlResolver().vcId` →
 * `useVcSettingsTabData` (engine-conditional sub-section orchestration) →
 * `VCSettingsTabView` (presentational).
 *
 * The settings shell mounts no ambient `StorageConfigContextProvider`, so the
 * outer mounts a `virtualContributor`-scoped one (the system-prompt editor is
 * always EDIT mode → `temporaryLocation: false`); the upload hook runs only
 * inside it.
 *
 * The cards that render are determined entirely by the data hook (Decision
 * #17 truth table). The view orchestrator only renders cards whose props are
 * present.
 */
const CrdVCSettingsTab = () => {
  const { vcId } = useUrlResolver();
  if (!vcId) {
    return <CrdVCSettingsTabBody />;
  }
  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={vcId}>
      <CrdVCSettingsTabWithUpload />
    </StorageConfigContextProvider>
  );
};

const CrdVCSettingsTabWithUpload = () => {
  const md = useMarkdownEditorIntegration();
  return <CrdVCSettingsTabBody markdownUpload={md} />;
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
