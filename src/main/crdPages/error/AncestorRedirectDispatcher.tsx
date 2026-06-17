import { useLocation } from 'react-router-dom';

import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { RedirectToAncestorDialog as MuiRedirectToAncestorDialog } from '@/core/40XErrorHandler/RedirectToAncestorDialog';
import { CrdRedirectToAncestorDialog } from '@/main/crdPages/error/CrdRedirectToAncestorDialog';
import { isCrdRoute } from '@/main/crdPages/error/isCrdRoute';

type AncestorRedirectDispatcherProps = {
  closestAncestor: ClosestAncestor;
};

/**
 * Dispatches between the CRD-styled redirect dialog and the legacy MUI one based
 * on whether the current pathname is a CRD route. This dispatcher only renders
 * when the boundary has a `closestAncestor`, which happens exclusively for
 * `NotFoundError` and `NotAuthorizedError` — and both render a CRD error page
 * beneath (`CrdNotFoundPage` / `CrdForbiddenPage`) whenever `isCrdRoute`. So the
 * dialog must be CRD in those cases to match the page underneath.
 */
export function AncestorRedirectDispatcher({ closestAncestor }: AncestorRedirectDispatcherProps) {
  const { pathname } = useLocation();

  if (isCrdRoute(pathname)) {
    return <CrdRedirectToAncestorDialog closestAncestor={closestAncestor} />;
  }

  return <MuiRedirectToAncestorDialog closestAncestor={closestAncestor} />;
}
