import { VCCreationWizardView } from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView';
import {
  StorageConfigContextProvider,
  useStorageConfigContext,
} from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import type { UserAccountProps } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/virtualContributorProps';
import { useVcCreationWizard } from './useVcCreationWizard';

export type CrdVCCreationWizardDialogProps = {
  open: boolean;
  onClose: () => void;
  /**
   * Account that will host the new VC. Passed by the account-tab launch points
   * (user / organization). The dashboard launch points omit it, so the wizard
   * defaults to the current user's account (resolved via
   * `useNewVirtualContributorMySpacesQuery`).
   */
  account?: UserAccountProps;
  accountName?: string;
};

/**
 * Controlled CRD "Create Virtual Contributor" wizard dialog. The launch point
 * owns the open state and supplies the target account; this connector runs the
 * step machine + GraphQL orchestration (`useVcCreationWizard`) and renders the
 * pure dialog view.
 */
export const CrdVCCreationWizardDialog = ({ open, onClose, account, accountName }: CrdVCCreationWizardDialogProps) => {
  const { accountId, ...wizard } = useVcCreationWizard({
    initialAccount: account,
    accountName,
    onExit: onClose,
  });

  const loading = wizard.loading || wizard.subspacesLoading;

  // Body-of-knowledge post/document images upload into the owning account's
  // storage bucket as temporary files; the server relocates them to the new
  // VC's own bucket on creation. With no resolved account id there is no bucket
  // to scope to, so the editors fall back to link-only (no upload button).
  if (!accountId) {
    return <VCCreationWizardView {...wizard} open={open} onClose={onClose} loading={loading} />;
  }

  return (
    <StorageConfigContextProvider locationType="account" accountId={accountId}>
      <VCCreationWizardWithUpload wizard={wizard} open={open} onClose={onClose} loading={loading} />
    </StorageConfigContextProvider>
  );
};

type WizardProps = Omit<ReturnType<typeof useVcCreationWizard>, 'accountId'>;

/**
 * Renders the wizard inside the account storage scope and wires markdown image
 * upload — but only when the viewer holds the `FileUpload` privilege on the
 * account bucket. Without it, the upload affordance is hidden (link-only).
 */
const VCCreationWizardWithUpload = ({
  wizard,
  open,
  onClose,
  loading,
}: {
  wizard: WizardProps;
  open: boolean;
  onClose: () => void;
  loading: boolean;
}) => {
  const canUpload = useStorageConfigContext()?.canUpload ?? false;
  const markdownUpload = useMarkdownEditorIntegration({ temporaryLocation: true });
  const uploadProps = canUpload ? markdownUpload : undefined;

  return <VCCreationWizardView {...wizard} {...uploadProps} open={open} onClose={onClose} loading={loading} />;
};

export default CrdVCCreationWizardDialog;
