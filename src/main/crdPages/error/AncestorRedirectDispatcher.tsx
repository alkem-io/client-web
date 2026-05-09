import { useLocation } from 'react-router-dom';

import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { RedirectToAncestorDialog as MuiRedirectToAncestorDialog } from '@/core/40XErrorHandler/RedirectToAncestorDialog';
import { CrdRedirectToAncestorDialog } from '@/main/crdPages/error/CrdRedirectToAncestorDialog';
import { isCrdRoute } from '@/main/crdPages/error/isCrdRoute';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';

type AncestorRedirectDispatcherProps = {
  closestAncestor: ClosestAncestor;
  /**
   * Mirrors the boundary's `isNotAuthorized` flag. Only when this is true does
   * the dispatcher consider rendering the CRD dialog — the underlying error
   * page is the CRD forbidden page only on `NotAuthorizedError`. For
   * `NotFoundError` (and anything else) the underlying page is the MUI
   * `Error40X` and we keep the MUI dialog on top to preserve visual
   * consistency.
   */
  isNotAuthorized?: boolean;
};

/**
 * Dispatches between the CRD-styled redirect dialog and the legacy MUI one
 * based on (a) the CRD toggle, (b) whether the current pathname is a
 * CRD-enabled route, and (c) whether the underlying error is `NotAuthorized`
 * (the only error class for which the CRD page renders below). When all three
 * hold, the CRD dialog is rendered; otherwise the existing MUI implementation
 * is preserved unchanged so the dialog visually matches the page beneath it.
 */
export function AncestorRedirectDispatcher({ closestAncestor, isNotAuthorized }: AncestorRedirectDispatcherProps) {
  const crdEnabled = useCrdEnabled();
  const { pathname } = useLocation();
  const useCrd = crdEnabled && isCrdRoute(pathname) && isNotAuthorized === true;

  if (useCrd) {
    return <CrdRedirectToAncestorDialog closestAncestor={closestAncestor} />;
  }

  return <MuiRedirectToAncestorDialog closestAncestor={closestAncestor} />;
}
