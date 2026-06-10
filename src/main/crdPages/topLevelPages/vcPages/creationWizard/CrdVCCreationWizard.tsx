import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { VCCreationWizardView } from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import {
  StorageConfigContextProvider,
  useStorageConfigContext,
} from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import type { UserAccountProps } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/virtualContributorProps';
import { useVcCreationWizard } from './useVcCreationWizard';

export type WizardLocationState = { account?: UserAccountProps; accountName?: string };

/**
 * Context-agnostic body of the VC creation wizard. The target account arrives
 * via router location state (set by the launch point); breadcrumbs are owned by
 * the per-context page wrappers (`CrdVCCreationWizardPage` for users,
 * `CrdOrgVCCreationWizardPage` for organizations).
 */
export const CrdVCCreationWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as WizardLocationState | null;

  const { accountId, ...wizard } = useVcCreationWizard({
    initialAccount: state?.account,
    accountName: state?.accountName,
    onExit: () => navigate(ROUTE_HOME),
  });

  const loading = wizard.loading || wizard.subspacesLoading;

  // Body-of-knowledge post/document images upload into the owning account's
  // storage bucket as temporary files; the server relocates them to the new
  // VC's own bucket on creation. With no resolved account id there is no bucket
  // to scope to, so the editors fall back to link-only (no upload button).
  if (!accountId) {
    return <VCCreationWizardView {...wizard} loading={loading} />;
  }

  return (
    <StorageConfigContextProvider locationType="account" accountId={accountId}>
      <VCCreationWizardWithUpload wizard={wizard} loading={loading} />
    </StorageConfigContextProvider>
  );
};

type WizardProps = Omit<ReturnType<typeof useVcCreationWizard>, 'accountId'>;

/**
 * Renders the wizard inside the account storage scope and wires markdown image
 * upload — but only when the viewer holds the `FileUpload` privilege on the
 * account bucket. Without it, the upload affordance is hidden (link-only).
 */
const VCCreationWizardWithUpload = ({ wizard, loading }: { wizard: WizardProps; loading: boolean }) => {
  const canUpload = useStorageConfigContext()?.canUpload ?? false;
  const markdownUpload = useMarkdownEditorIntegration({ temporaryLocation: true });
  const uploadProps = canUpload ? markdownUpload : undefined;

  return <VCCreationWizardView {...wizard} {...uploadProps} loading={loading} />;
};
