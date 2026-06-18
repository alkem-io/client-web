import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { CrdRedirectToAncestorDialog } from '@/main/crdPages/error/CrdRedirectToAncestorDialog';

type AncestorRedirectDispatcherProps = {
  closestAncestor: ClosestAncestor;
};

/**
 * Renders the CRD-styled redirect dialog for boundaries that carry a
 * `closestAncestor` (i.e. `NotFoundError` / `NotAuthorizedError`). CRD is the
 * only runtime path — every top-level route renders its CRD page and the error
 * pages beneath are CRD (`CrdNotFoundPage` / `CrdForbiddenPage`) — so the
 * redirect dialog is always CRD too. (The legacy MUI redirect dialog and the
 * route-based dispatch it required were removed with the MUI route tree.)
 */
export function AncestorRedirectDispatcher({ closestAncestor }: AncestorRedirectDispatcherProps) {
  return <CrdRedirectToAncestorDialog closestAncestor={closestAncestor} />;
}
