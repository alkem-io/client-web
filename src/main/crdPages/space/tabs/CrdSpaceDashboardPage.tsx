import { createPortal } from 'react-dom';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { useCrdSpaceDashboard } from '../hooks/useCrdSpaceDashboard';

export default function CrdSpaceDashboardPage() {
  const { space } = useSpace();
  const { posts, canCreateCallout, tabDescription, dashboardNavigation, loading } = useCrdSpaceDashboard();

  const subspaces =
    dashboardNavigation?.children?.map(child => ({
      name: child.displayName,
      initials: getInitials(child.displayName),
      color: 'var(--chart-1)',
      href: child.url,
    })) ?? [];

  const sidebarContainer = document.getElementById('crd-space-sidebar');

  return (
    <>
      {sidebarContainer &&
        createPortal(
          <SpaceSidebar
            variant="home"
            description={tabDescription || space.about.profile.description || ''}
            subspaces={subspaces}
          />,
          sidebarContainer
        )}

      <CalloutListConnector posts={posts} canCreate={canCreateCallout} loading={loading} />
    </>
  );
}
