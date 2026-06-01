import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { CommunityUpdatesDialog } from '@/crd/components/space/CommunityUpdatesDialog';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { UpdatesSection } from '@/crd/components/space/sidebar/UpdatesSection';
import { Button } from '@/crd/primitives/button';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { CrdSpaceAboutDialogConnector } from '../dialogs/CrdSpaceAboutDialogConnector';
import { useCrdCalendarSidebar } from '../hooks/useCrdCalendarSidebar';
import { useCrdCommunityUpdates } from '../hooks/useCrdCommunityUpdates';
import { useCrdSpaceDashboard } from '../hooks/useCrdSpaceDashboard';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { useCrdSpaceLocale } from '../hooks/useCrdSpaceLocale';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';
import { SpaceApplyButtonConnector } from '../SpaceApplyButtonConnector';
import { CrdCalendarDialogConnector } from '../timeline/CrdCalendarDialogConnector';
import { useCrdCalendarUrlState } from '../timeline/useCrdCalendarUrlState';

export default function CrdSpaceDashboardPage() {
  const { t } = useTranslation('crd-space');
  const { space } = useSpace();
  const navigate = useNavigate();
  const {
    callouts,
    calloutsSetId,
    canCreateCallout,
    canReorderCallouts,
    tabDescription,
    dashboardNavigation,
    flowStateForNewCallouts,
    loading,
  } = useCrdSpaceDashboard();
  const { events: sidebarEvents, canCreateEvents } = useCrdCalendarSidebar();
  const { navigateToList, navigateToCreate, navigateToEvent } = useCrdCalendarUrlState();
  const locale = useCrdSpaceLocale();
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const communityUpdates = useCrdCommunityUpdates(space.about.membership?.communityID);
  const [createOpen, setCreateOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);

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
      avatarUrl: child.avatar?.uri,
      isPrivate: child.private,
      isPinned: child.pinned,
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
          subspacesHref={buildSpaceSectionUrl(space.about.profile.url ?? '', 3)}
          events={sidebarEvents}
          onShowCalendar={openCalendar}
          onAddEvent={canCreateEvents ? openCreateEvent : undefined}
          onEventClick={openEventDetail}
          locale={locale}
          updatesSlot={
            <UpdatesSection
              latest={communityUpdates.latest}
              total={communityUpdates.total}
              onSeeAll={() => setUpdatesOpen(true)}
              locale={locale}
            />
          }
        />
      </SpaceSidebarPortal>

      <SpaceApplyButtonConnector
        spaceId={space.id}
        spaceProfileUrl={space.about.profile.url}
        communityName={space.about.profile.displayName}
        className="mb-6"
      />

      <SpaceTabActionHeader
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

      <CalloutListConnector
        callouts={callouts}
        calloutsSetId={calloutsSetId}
        canReorder={canReorderCallouts}
        loading={loading}
      />

      {canCreateCallout && (
        <CalloutFormConnector
          open={createOpen}
          onOpenChange={setCreateOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={flowStateForNewCallouts?.displayName}
          defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}
        />
      )}

      <CrdCalendarDialogConnector open={calendarOpen} onOpenChange={setCalendarOpen} />

      <CrdSpaceAboutDialogConnector open={aboutOpen} onOpenChange={setAboutOpen} />

      <CommunityUpdatesDialog
        open={updatesOpen}
        onOpenChange={setUpdatesOpen}
        updates={communityUpdates.updates}
        loading={communityUpdates.loading}
        locale={locale}
      />
    </>
  );
}
