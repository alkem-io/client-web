import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { Button } from '@/crd/primitives/button';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { CrdSpaceAboutDialogConnector } from '../dialogs/CrdSpaceAboutDialogConnector';
import { useCrdCalendarSidebar } from '../hooks/useCrdCalendarSidebar';
import { useCrdSpaceDashboard } from '../hooks/useCrdSpaceDashboard';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { useCrdSpaceLocale } from '../hooks/useCrdSpaceLocale';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
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
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

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
      href: child.url,
    })) ?? [];

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar
          variant="home"
          description={space.about.profile.description || ''}
          leads={sidebarLeads}
          onEditClick={() => navigate(`${space.about.profile.url}/settings/about`)}
          onAboutClick={() => setAboutOpen(true)}
          subspaces={subspaces}
          events={sidebarEvents}
          onShowCalendar={openCalendar}
          onAddEvent={canCreateEvents ? openCreateEvent : undefined}
          onEventClick={openEventDetail}
          locale={locale}
        />
      </SpaceSidebarPortal>

      <SpaceApplyButtonConnector spaceId={space.id} spaceProfileUrl={space.about.profile.url} className="mb-6" />

      <TabStateHeader
        description={tabDescription}
        action={
          canCreateCallout && (
            <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('feed.addPost')}
            </Button>
          )
        }
        className="mb-6"
      />

      <CalloutListConnector callouts={callouts} calloutsSetId={calloutsSetId} loading={loading} />

      {canCreateCallout && (
        <CalloutFormConnector open={createOpen} onOpenChange={setCreateOpen} calloutsSetId={calloutsSetId} />
      )}

      <CrdCalendarDialogConnector open={calendarOpen} onOpenChange={setCalendarOpen} />

      <CrdSpaceAboutDialogConnector open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
