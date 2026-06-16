import { reservedTopLevelRoutePaths, TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

/**
 * Reserved top-level segments whose pages render in the CRD shell when the design
 * toggle is on (see the `crdEnabled ? <Crd…> : <Mui…>` dispatch in
 * `TopLevelRoutes.tsx`, and the in-route toggles such as `InnovationPackRoute`).
 *
 * `isCrdRoute` must return `true` for these so the error / redirect surfaces use
 * CRD chrome too — otherwise a CRD user hitting a private VC, innovation pack,
 * organization, etc. drops into MUI chrome (a CRD page beneath a MUI error/dialog).
 *
 * MUST be kept in sync with the CRD dispatch in `TopLevelRoutes.tsx`. Segments that
 * still render MUI when the toggle is on are intentionally absent:
 *   - `contributors` → `ContributorsPage` (MUI, no CRD branch)
 *   - `innovation-hubs` → `InnovationHubsRoutes` (MUI, no CRD branch)
 *   - redirect/legacy-only segments (`documentation`, `help`, `about`, `contact`,
 *     `landing`, `identity`, `create-space`, `profile`).
 *
 * Note: the `/vc/:id/knowledge-base` sub-route is still a MUI island, but the VC
 * section's dominant chrome is CRD and the 40X error is thrown at URL-resolution
 * time (before the MUI page renders), so CRD error chrome is the consistent choice.
 */
const crdMigratedTopLevelSegments = new Set<string>([
  TopLevelRoutePath.Home,
  TopLevelRoutePath.Spaces,
  TopLevelRoutePath.Restricted,
  TopLevelRoutePath.Docs,
  TopLevelRoutePath.Admin,
  TopLevelRoutePath.User,
  TopLevelRoutePath.VirtualContributor,
  TopLevelRoutePath.Organization,
  TopLevelRoutePath.InnovationLibrary,
  TopLevelRoutePath.InnovationPacks,
  TopLevelRoutePath.Hub,
  TopLevelRoutePath.Forum,
]);

export function isCrdRoute(pathname: string): boolean {
  if (!pathname) {
    return false;
  }

  let normalized = pathname.split('?')[0].split('#')[0];

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized === '' || normalized === '/') {
    return false;
  }

  if (normalized.startsWith('/public/whiteboard/')) {
    return true;
  }

  const firstSegment = normalized.split('/')[1];

  if (!firstSegment) {
    return false;
  }

  // Reserved segment that has been migrated to the CRD shell.
  if (crdMigratedTopLevelSegments.has(firstSegment)) {
    return true;
  }

  // Non-reserved first segment → dynamic Space / Subspace route (CRD shell).
  if (!reservedTopLevelRoutePaths.includes(firstSegment)) {
    return true;
  }

  return false;
}
