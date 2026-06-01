import useNavigate from '@/core/routing/useNavigate';
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
 * Close behaviour mirrors the legacy MUI `SubspaceAboutPage`: when the viewer
 * has no read access, closing hard-navigates to the parent space URL instead
 * of going back in history — otherwise the protected-routes guard would
 * re-fire on the previous subspace URL and trap the user in a redirect loop.
 */
export default function CrdSubspaceAboutPage() {
  const { subspace, permissions } = useSubSpace();
  const {
    space: {
      about: {
        profile: { url: parentSpaceUrl },
      },
    },
  } = useSpace();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(permissions.canRead ? subspace.about.profile.url : parentSpaceUrl);
  };

  return <CrdSubspaceAbout open={true} onClose={handleClose} />;
}
