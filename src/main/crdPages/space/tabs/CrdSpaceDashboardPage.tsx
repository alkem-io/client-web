import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { useCrdCalendarSidebar } from '../hooks/useCrdCalendarSidebar';
import { useCrdSpaceDashboard } from '../hooks/useCrdSpaceDashboard';
import { useCrdSpaceLocale } from '../hooks/useCrdSpaceLocale';
import { SpaceApplyButtonConnector } from '../SpaceApplyButtonConnector';
import { CrdCalendarDialogConnector } from '../timeline/CrdCalendarDialogConnector';
import { useCrdCalendarUrlState } from '../timeline/useCrdCalendarUrlState';

export default function CrdSpaceDashboardPage() {
  const { t } = useTranslation('crd-space');
  const { space } = useSpace();
  const navigate = useNavigate();
  const { callouts, calloutsSetId, canCreateCallout, tabDescription, dashboardNavigation, loading } =
    useCrdSpaceDashboard();
  const { events: sidebarEvents, canCreateEvents } = useCrdCalendarSidebar();
  const { navigateToList, navigateToCreate, navigateToEvent } = useCrdCalendarUrlState();
  const locale = useCrdSpaceLocale();
  const [createOpen, setCreateOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const openCalendar = () => {
    setCalendarOpen(true);
    navigateToList();
  };
  const openCreateEvent = () => {
    setCalendarOpen(true);
    navigateToCreate();
  };
  const openEventDetail = (event: { url?: string }) => {
    if (!event.url) return;
    setCalendarOpen(true);
    navigateToEvent(event.url);
  };

  const subspaces =
    dashboardNavigation?.children?.map(child => ({
      name: child.displayName,
      initials: getInitials(child.displayName),
      color: pickColorFromId(child.id),
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
            onAboutClick={() => navigate(`${space.about.profile.url}/${EntityPageSection.About}`)}
            subspaces={subspaces}
            events={sidebarEvents}
            onShowCalendar={openCalendar}
            onAddEvent={canCreateEvents ? openCreateEvent : undefined}
            onEventClick={openEventDetail}
            locale={locale}
          />,
          sidebarContainer
        )}

      <SpaceApplyButtonConnector spaceId={space.id} spaceProfileUrl={space.about.profile.url} className="mb-6" />

      <CalloutListConnector
        title={t('feed.activity')}
        callouts={callouts}
        calloutsSetId={calloutsSetId}
        canCreate={canCreateCallout}
        onCreateClick={() => setCreateOpen(true)}
        loading={loading}
      />

      {canCreateCallout && (
        <CalloutFormConnector open={createOpen} onOpenChange={setCreateOpen} calloutsSetId={calloutsSetId} />
      )}

      <CrdCalendarDialogConnector open={calendarOpen} onOpenChange={setCalendarOpen} />
    </>
  );
}
