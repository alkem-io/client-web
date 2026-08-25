import { type ReactNode, useState } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import type { ContactLeadRecipient } from '@/crd/components/chat/ContactLeadsDialog';
import { CommunityGuidelinesBlock } from '@/crd/components/space/CommunityGuidelinesBlock';
import { CommunityUpdatesDialog } from '@/crd/components/space/CommunityUpdatesDialog';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { AboutButton } from '@/crd/components/space/sidebar/AboutButton';
import { ContactLeadButton } from '@/crd/components/space/sidebar/ContactLeadButton';
import { CreatePostButton } from '@/crd/components/space/sidebar/CreatePostButton';
import { EventsSection } from '@/crd/components/space/sidebar/EventsSection';
import { InfoBlock } from '@/crd/components/space/sidebar/InfoBlock';
import { InviteButton } from '@/crd/components/space/sidebar/InviteButton';
import { PostIndexButton } from '@/crd/components/space/sidebar/PostIndexButton';
import { SubspacesSection } from '@/crd/components/space/sidebar/SubspacesSection';
import { UpdatesSection } from '@/crd/components/space/sidebar/UpdatesSection';
import { VirtualContributorsSection } from '@/crd/components/space/sidebar/VirtualContributorsSection';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSettingsTabUrl, buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { PostIndexDialogConnector } from '../callout/PostIndexDialogConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { ContactLeadsDialogConnector } from '../dialogs/ContactLeadsDialogConnector';
import { CrdSpaceAboutDialogConnector } from '../dialogs/CrdSpaceAboutDialogConnector';
import { InviteMembersDialogConnector } from '../dialogs/InviteMembersDialogConnector';
import { VirtualContributorInviteConnector } from '../dialogs/VirtualContributorInviteConnector';
import { useCrdCalendarSidebar } from '../hooks/useCrdCalendarSidebar';
import { useCrdCommunityUpdates } from '../hooks/useCrdCommunityUpdates';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';
import { useCrdSpaceDashboard } from '../hooks/useCrdSpaceDashboard';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { useCrdSpaceLocale } from '../hooks/useCrdSpaceLocale';
import { CrdCalendarDialogConnector } from '../timeline/CrdCalendarDialogConnector';
import { useCrdCalendarUrlState } from '../timeline/useCrdCalendarUrlState';
import { useSpaceApplyFlow } from '../useSpaceApplyFlow';
import { SpaceSidebarPortal } from './SpaceSidebarPortal';
import { deriveWidgetSkips, resolveSidebarPlan } from './sidebarWidgetPlan';

type SpaceTabSidebarConnectorProps = {
  /** The active state's stored `sidebar` — wire enum values (e.g. `'INTENT'`), NonNull per contract. */
  sidebar: readonly string[];
  /** calloutsSetId/classificationTagsets are already fetched by the page (for
   *  the main content feed) — reused here for the `index` widget's Post
   *  Index dialog rather than re-fetched, so configuring `index` on any tab
   *  never adds a network request beyond what the tab already issues. */
  calloutsSetId: string | undefined;
  classificationTagsets: ClassificationTagsetModel[];
  tabPosition: number;
  /** Whether the viewer can create posts — the configurable `createPost` widget
   *  renders its Add Post button only when true (invisible otherwise). */
  canCreatePost: boolean;
  /** Opens the create-post (callout) dialog, which the page owns. */
  onCreatePost: () => void;
  /** Fixed tab actions (Create Subspace) rendered above the configured widgets —
   *  a position-keyed affordance that is not itself a configurable widget in this
   *  slice (A-03/D-08). The page owns its handler and dialog; the sidebar only
   *  renders the button. */
  actionsSlot?: ReactNode;
};

/**
 * Renders the active tab's sidebar 100% from its configured widget list, in
 * order (FR-011). Every widget's data hook is called unconditionally (Rules
 * of Hooks) with `skip` set when the widget is not in the resolved plan, so
 * opening a tab never fetches data for widgets it doesn't render (FR-019).
 */
export function SpaceTabSidebarConnector({
  sidebar,
  calloutsSetId,
  classificationTagsets,
  tabPosition,
  canCreatePost,
  onCreatePost,
  actionsSlot,
}: SpaceTabSidebarConnectorProps) {
  const { space, permissions } = useSpace();
  const navigate = useNavigate();
  const locale = useCrdSpaceLocale();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [vcInviteOpen, setVcInviteOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);

  const plan = resolveSidebarPlan(sidebar);
  const skips = deriveWidgetSkips(plan);
  // contactLeads/addUser/virtualContributors/guidelines share one fetch group.
  const communitySkip = skips.contactLeads && skips.addUser && skips.virtualContributors && skips.guidelines;

  const {
    isMember: isSpaceMember,
    buttonProps: applyButtonProps,
    dialogs: applyDialogs,
  } = useSpaceApplyFlow({
    spaceId: space.id,
    spaceProfileUrl: space.about.profile.url,
    communityName: space.about.profile.displayName,
    skip: skips.applicationButton,
  });

  const sidebarLeads = useCrdSpaceLeads(space.id, skips.intent);

  const { dashboardNavigation } = useCrdSpaceDashboard({ skip: skips.subspaceLinks });
  const subspaces =
    dashboardNavigation?.children?.map(child => ({
      name: child.displayName,
      initials: getInitials(child.displayName),
      href: child.url,
      avatarUrl: child.avatar?.uri,
      isPrivate: child.private,
      isPinned: child.pinned,
    })) ?? [];

  const { events: sidebarEvents, canCreateEvents } = useCrdCalendarSidebar(skips.events);
  const { isAnyCalendarRoute, navigateToList, navigateToCreate, navigateToEvent } = useCrdCalendarUrlState();
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

  const communityUpdates = useCrdCommunityUpdates(space.about.membership?.communityID, skips.updates);

  const { leadUsers, virtualContributors, hasVcEntitlement, canInvite, communityId, roleSetId, guidelines } =
    useCrdSpaceCommunity({ skip: communitySkip });
  const canContactLeads = leadUsers.length > 0 && Boolean(communityId);
  const canInviteVc = hasVcEntitlement && canInvite && Boolean(roleSetId);
  const leadRecipients: ContactLeadRecipient[] = leadUsers.map(lead => ({
    id: lead.id,
    displayName: lead.name,
    avatarUrl: lead.avatarUrl,
  }));

  const onEditClick = permissions.canUpdate
    ? () => navigate(buildSettingsTabUrl(space.about.profile.url, 'about'))
    : undefined;

  const sections: Record<string, ReactNode> = {
    intent: (
      <InfoBlock
        key="intent"
        description={space.about.profile.description || ''}
        leads={sidebarLeads}
        onEditClick={onEditClick}
      />
    ),
    about: <AboutButton key="about" onClick={() => setAboutOpen(true)} />,
    createPost: canCreatePost && <CreatePostButton key="createPost" onClick={onCreatePost} />,
    applicationButton: !isSpaceMember && (
      <SpaceAboutApplyButton key="applicationButton" {...applyButtonProps} className="w-full" />
    ),
    subspaceLinks: subspaces.length > 0 && (
      <SubspacesSection
        key="subspaceLinks"
        subspaces={subspaces}
        showAllHref={buildSpaceSectionUrl(space.about.profile.url ?? '', 3)}
      />
    ),
    events: (
      <EventsSection
        key="events"
        events={sidebarEvents}
        onShowCalendar={openCalendar}
        onAddEvent={canCreateEvents ? openCreateEvent : undefined}
        onEventClick={openEventDetail}
        locale={locale}
      />
    ),
    updates: (
      <UpdatesSection
        key="updates"
        latest={communityUpdates.latest}
        total={communityUpdates.total}
        onSeeAll={() => setUpdatesOpen(true)}
        locale={locale}
      />
    ),
    contactLeads: canContactLeads && <ContactLeadButton key="contactLeads" onClick={() => setContactOpen(true)} />,
    addUser: canInvite && <InviteButton key="addUser" onClick={() => setInviteOpen(true)} />,
    virtualContributors: hasVcEntitlement && (virtualContributors.length > 0 || canInviteVc) && (
      <VirtualContributorsSection
        key="virtualContributors"
        contributors={virtualContributors}
        onContributorClick={href => navigate(href)}
        onInviteVc={canInviteVc ? () => setVcInviteOpen(true) : undefined}
      />
    ),
    guidelines: guidelines.id && (
      <CommunityGuidelinesBlock
        key="guidelines"
        displayName={guidelines.displayName}
        description={guidelines.description}
        references={guidelines.references}
        loading={guidelines.loading}
        canEdit={permissions.canUpdate}
        onEditClick={() => navigate(buildSettingsTabUrl(space.about.profile.url, 'community', 'guidelines'))}
      />
    ),
    index: <PostIndexButton key="index" onClick={() => setIndexOpen(true)} />,
  };

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar>
          {actionsSlot && <div className="flex flex-col gap-2">{actionsSlot}</div>}
          {plan.map(widgetId => sections[widgetId])}
        </SpaceSidebar>
      </SpaceSidebarPortal>

      <CrdSpaceAboutDialogConnector open={aboutOpen} onOpenChange={setAboutOpen} />

      {!skips.applicationButton && applyDialogs}

      {/* Sole mount point for the /calendar and /calendar/:eventId deep-link routes.
          Widget-driven for the sidebar Events button (!skips.events), but ALSO
          route-driven: a shared/notification calendar link must open the dialog even
          when the active tab's plan omits the `events` widget (on develop the
          connector was mounted unconditionally, so these links always worked).
          Closing navigates away from /calendar, which drops the route-driven mount. */}
      {(!skips.events || isAnyCalendarRoute) && (
        <CrdCalendarDialogConnector open={calendarOpen} onOpenChange={setCalendarOpen} />
      )}

      <CommunityUpdatesDialog
        open={updatesOpen}
        onOpenChange={setUpdatesOpen}
        updates={communityUpdates.updates}
        loading={communityUpdates.loading}
        locale={locale}
      />

      {canContactLeads && (
        <ContactLeadsDialogConnector open={contactOpen} onOpenChange={setContactOpen} recipients={leadRecipients} />
      )}

      {canInvite && (
        <InviteMembersDialogConnector
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onlyFromParentCommunity={space.level === SpaceLevel.L2}
        />
      )}

      {canInviteVc && roleSetId && (
        <VirtualContributorInviteConnector
          open={vcInviteOpen}
          onClose={() => setVcInviteOpen(false)}
          roleSetId={roleSetId}
          spaceId={space.id}
          spaceLevel={space.level}
          spaceName={space.about.profile.displayName}
        />
      )}

      <PostIndexDialogConnector
        open={indexOpen}
        onOpenChange={setIndexOpen}
        calloutsSetId={calloutsSetId}
        classificationTagsets={classificationTagsets}
        tabSectionNumber={tabPosition + 1}
      />
    </>
  );
}
