import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { VCCreationWizardView } from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
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

  const wizard = useVcCreationWizard({
    initialAccount: state?.account,
    accountName: state?.accountName,
    onExit: () => navigate(ROUTE_HOME),
  });

  return <VCCreationWizardView {...wizard} loading={wizard.loading || wizard.subspacesLoading} />;
};
