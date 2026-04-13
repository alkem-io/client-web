import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { useCrdSpaceDashboard } from '../hooks/useCrdSpaceDashboard';

export default function CrdSpaceDashboardPage() {
  const { t } = useTranslation('crd-space');
  const { space } = useSpace();
  const { callouts, calloutsSetId, canCreateCallout, tabDescription, dashboardNavigation, loading } =
    useCrdSpaceDashboard();
  const [createOpen, setCreateOpen] = useState(false);

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

      <CalloutListConnector
        title={t('feed.activity')}
        callouts={callouts}
        calloutsSetId={calloutsSetId}
        canCreate={canCreateCallout}
        onCreateClick={() => setCreateOpen(true)}
        loading={loading}
      />

      {canCreateCallout && <CalloutFormConnector open={createOpen} onOpenChange={setCreateOpen} />}
    </>
  );
}
