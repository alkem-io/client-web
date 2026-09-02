import useNavigate from '@/core/routing/useNavigate';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { CrdSubspaceAbout } from './CrdSubspaceAbout';

/**
 * CRD subspace (L1/L2) About route (`/about`).
 *
 * Thin wrapper around the shared `CrdSubspaceAbout` — the same component the
 * sidebar "About" trigger mounts — so both entry points render an identical
 * About with the identical apply flow.
 *
 * Close behaviour: closing hard-navigates rather than going back in history,
 * otherwise the protected-routes guard would re-fire on the previous subspace
 * URL and trap the user in a redirect loop. We navigate to the most specific
 * place the viewer can actually open:
 *  - the subspace itself when they can read it (member),
 *  - else the parent space when they can read that,
 *  - else home — so a user with only a pending invitation (no access to either
 *    the subspace or its private parent) can still escape the About dialog
 *    instead of bouncing between two blocking About dialogs.
 */
export default function CrdSubspaceAboutPage() {
  const { subspace, permissions } = useSubSpace();
  const {
    space: {
      about: {
        profile: { url: parentSpaceUrl },
      },
    },
    permissions: parentPermissions,
  } = useSpace();
  const navigate = useNavigate();

  const handleClose = () => {
    if (permissions.canRead) {
      navigate(subspace.about.profile.url);
    } else if (parentPermissions.canRead && parentSpaceUrl) {
      navigate(parentSpaceUrl);
    } else {
      navigate(ROUTE_HOME);
    }
  };

  return <CrdSubspaceAbout open={true} onClose={handleClose} />;
}
