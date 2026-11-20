import type { FC, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import type { AdminSectionId } from './adminSections';
import { useVisibleAdminSections } from './useVisibleAdminSections';

type AdminSectionGuardProps = PropsWithChildren<{
  sectionId: AdminSectionId;
}>;

/**
 * Route-level guard for one admin section.
 *
 * `useVisibleAdminSections` — and, underneath it, `resolveVisibleAdminSections`
 * in `adminSectionAccess.ts` — is the single answer already driving the shell's
 * nav filter (`CrdAdminShellPage`). This guard reads that SAME answer at the
 * route level, so a section hidden from the nav cannot still be reached by
 * typing its URL directly: the deep link now redirects instead of rendering a
 * page whose queries the server refuses.
 */
const AdminSectionGuard: FC<AdminSectionGuardProps> = ({ sectionId, children }) => {
  const { pathname } = useLocation();
  const { sections, loading } = useVisibleAdminSections();

  if (loading) {
    return <Loading />;
  }

  const isVisible = sections.some(section => section.id === sectionId);

  if (!isVisible) {
    return <Navigate to={`/restricted?origin=${encodeURIComponent(pathname)}`} replace={true} />;
  }

  return <>{children}</>;
};

export default AdminSectionGuard;
