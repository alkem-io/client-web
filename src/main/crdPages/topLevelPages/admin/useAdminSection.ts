import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { ADMIN_SECTIONS, type AdminSectionId, DEFAULT_ADMIN_SECTION, isAdminSectionId } from './adminSections';

/**
 * Resolves the active admin section from the URL (the segment immediately after
 * `/admin/`) and exposes a navigation handler that pushes the section's
 * canonical path from `ADMIN_SECTIONS` — never an inline template, per the URL
 * Construction rule in `docs/crd/migration-guide.md`.
 */
export const useAdminSection = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const adminIdx = segments.indexOf('admin');
  const sectionSegment =
    adminIdx >= 0 && adminIdx < segments.length - 1 ? segments[adminIdx + 1] : DEFAULT_ADMIN_SECTION;

  const activeSection: AdminSectionId = isAdminSectionId(sectionSegment) ? sectionSegment : DEFAULT_ADMIN_SECTION;

  const onSectionChange = (next: AdminSectionId) => {
    const target = ADMIN_SECTIONS.find(section => section.id === next)?.path;
    if (target) navigate(target);
  };

  return { activeSection, onSectionChange };
};

export default useAdminSection;
