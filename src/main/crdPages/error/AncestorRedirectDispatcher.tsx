import { useLocation } from 'react-router-dom';

import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { RedirectToAncestorDialog as MuiRedirectToAncestorDialog } from '@/core/40XErrorHandler/RedirectToAncestorDialog';
import { CrdRedirectToAncestorDialog } from '@/main/crdPages/error/CrdRedirectToAncestorDialog';
import { isCrdRoute } from '@/main/crdPages/error/isCrdRoute';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';

type AncestorRedirectDispatcherProps = {
  closestAncestor: ClosestAncestor;
};

/**
 * Dispatches between the CRD-styled redirect dialog and the legacy MUI one
 * based on (a) the CRD toggle and (b) whether the current pathname is a
 * CRD-enabled route. This dispatcher only renders when the boundary has a
 * `closestAncestor`, which happens exclusively for `NotFoundError` and
 * `NotAuthorizedError` — and both now render a CRD error page beneath
 * (`CrdNotFoundPage` / `CrdForbiddenPage`) whenever `crdEnabled && isCrdRoute`.
 * So the dialog must be CRD in both cases to match the page underneath;
 * otherwise the existing MUI implementation is preserved unchanged.
 */
export function AncestorRedirectDispatcher({ closestAncestor }: AncestorRedirectDispatcherProps) {
  const crdEnabled = useCrdEnabled();
  const { pathname } = useLocation();
  const useCrd = crdEnabled && isCrdRoute(pathname);

  if (useCrd) {
    return <CrdRedirectToAncestorDialog closestAncestor={closestAncestor} />;
  }

  return <MuiRedirectToAncestorDialog closestAncestor={closestAncestor} />;
}
