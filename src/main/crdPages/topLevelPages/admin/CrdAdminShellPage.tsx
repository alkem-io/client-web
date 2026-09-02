import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { AdminShell, type AdminShellSection } from '@/crd/components/admin/AdminShell';
import { ADMIN_SECTIONS, type AdminSectionId } from './adminSections';
import { useAdminSection } from './useAdminSection';

/**
 * Hosts the CRD global-admin shell — sticky title + section tab strip + outlet
 * for the active section body. Derives the active section from the URL and
 * navigates on tab change via `useAdminSection`. Access is gated upstream in
 * `CrdAdminRoutes` (NoIdentity + PlatformAdmin), matching the MUI admin.
 */
const CrdAdminShellPage = () => {
  const { t } = useTranslation('crd-admin');
  const { activeSection, onSectionChange } = useAdminSection();

  usePageTitle(t('pageTitle'));

  // Explicit per-section t() calls keep the labels fully typed against the
  // crd-admin resource (no dynamic-key casting).
  const sectionLabels: Record<AdminSectionId, string> = {
    spaces: t('sections.spaces'),
    users: t('sections.users'),
    organizations: t('sections.organizations'),
    'innovation-packs': t('sections.innovation-packs'),
    'innovation-hubs': t('sections.innovation-hubs'),
    'virtual-contributors': t('sections.virtual-contributors'),
    authorization: t('sections.authorization'),
    'authorization-policies': t('sections.authorization-policies'),
    transfer: t('sections.transfer'),
  };

  const sections: ReadonlyArray<AdminShellSection<AdminSectionId>> = ADMIN_SECTIONS.map(section => ({
    id: section.id,
    label: sectionLabels[section.id],
    icon: section.icon,
  }));

  return (
    <AdminShell
      title={t('pageTitle')}
      sections={sections}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <Outlet />
    </AdminShell>
  );
};

export default CrdAdminShellPage;
