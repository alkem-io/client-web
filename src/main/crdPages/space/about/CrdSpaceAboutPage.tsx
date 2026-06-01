import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import { useSpace } from '@/domain/space/context/useSpace';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { CrdSpaceAbout } from './CrdSpaceAbout';

/**
 * CRD L0 Space About route (`/about`).
 *
 * Thin wrapper around the shared `CrdSpaceAbout` — the same component the
 * sidebar "About this Space" trigger mounts — so both entry points render an
 * identical About with the identical apply / guidelines / host-contact flow.
 *
 * Close behaviour mirrors the legacy MUI `SpaceAboutPage`: when the viewer
 * has no read access, closing hard-navigates two history entries back instead
 * of going to the (unreadable) space URL, matching the previous redirect-loop
 * avoidance.
 */
export default function CrdSpaceAboutPage() {
  const { space, permissions } = useSpace();
  const backToParentPage = useBackWithDefaultUrl(
    permissions.canRead ? space.about.profile.url : undefined,
    permissions.canRead ? undefined : 2
  );

  return (
    <StorageConfigContextProvider locationType="space" spaceId={space.id}>
      <CrdSpaceAbout open={true} onClose={backToParentPage} />
    </StorageConfigContextProvider>
  );
}
