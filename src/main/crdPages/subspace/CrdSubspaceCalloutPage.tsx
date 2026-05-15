import { useNavigate } from 'react-router-dom';
import { toRoutePath } from '@/crd/lib/toRoutePath';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { CrdCalloutDialogFromUrl } from '../space/callout/CrdCalloutDialogFromUrl';
import CrdSubspaceCalloutsPage from './tabs/CrdSubspaceCalloutsPage';

/**
 * Route element for `…/collaboration/:calloutNameId/*` at the subspace
 * (L1/L2) level. Renders the regular subspace callouts page behind the
 * CRD callout detail dialog so closing the dialog leaves the user on the
 * subspace's main content (mirrors `CrdSpaceCalloutPage` at L0).
 */
export default function CrdSubspaceCalloutPage() {
  const navigate = useNavigate();
  const { subspace } = useSubSpace();

  return (
    <>
      <CrdSubspaceCalloutsPage />
      <CrdCalloutDialogFromUrl
        onClose={() =>
          navigate(toRoutePath(subspace?.about.profile.url), { replace: true, state: { keepScroll: true } })
        }
      />
    </>
  );
}
