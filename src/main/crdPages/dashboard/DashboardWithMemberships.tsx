import type { ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useV2DashboardActivityQuery,
  useV2DashboardFeedSpacesQuery,
  useV2DashboardHostedResourcesQuery,
  useV2DashboardMembershipsQuery,
  useV2DashboardMostActiveSpacesQuery,
  useV2DashboardRecentSpacesQuery,
  useV2DashboardSaveUserSettingsMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { isNotServedYet } from '@/core/apollo/hooks/nativeErrorWording';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useReportedQueryError } from '@/core/apollo/hooks/useReportedQueryError';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import useNavigate from '@/core/routing/useNavigate';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { MyMembershipsPanel } from '@/crd/components/dashboard/MyMemberships/MyMembershipsPanel';
import { RecentSpaces } from '@/crd/components/dashboard/RecentSpaces';
import { TipsAndTricksDialog } from '@/crd/components/dashboard/TipsAndTricksDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useHomeSpaceSettings } from '@/domain/community/userCurrent/useHomeSpaceSettings';
import { CrdCreateSpaceDialog } from '@/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog';
import { CrdVCCreationWizardDialog } from '@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog';
import { URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';
import { LEGACY_VIEW_KEY, resolveActivityView, SEED_FLAG_KEY, shouldSeedFromLegacy } from './activityViewPreference';
import {
  type DashboardSpace,
  mapHostedSpacesToPanelItems,
  mapHostSection,
  mapLastActiveSection,
  mapLeadAdminSection,
  mapMostActivitySection,
  mapNativeActivityToFeedItems,
  mapRecentSpacesToCompactCards,
  WHITEBOARD_CONTENT_MODIFIED_ACTIVITY,
} from './dashboardDataMappers';
import { mapDashboardMemberships } from './dashboardV2DataMapper';
import { isVcCampaignTargeted, isVcCreationAvailable } from './isVcCampaignTargeted';
import { NonActivityHomeSections } from './NonActivityHomeSections';
import type { DashboardDialogType } from './useDashboardDialogs';
import { useDashboardSidebar } from './useDashboardSidebar';

type DashboardWithMembershipsProps = {
  dialogState: {
    openDialog: DashboardDialogType | null;
    openTipsAndTricks: () => void;
    openMyActivity: () => void;
    openMySpaceActivity: () => void;
    openMemberships: () => void;
    closeDialog: () => void;
  };
  onPendingMembershipsClick: () => void;
};

const EXCLUDED_ACTIVITY_TYPES = [WHITEBOARD_CONTENT_MODIFIED_ACTIVITY];
const ACTIVITY_PAGE_SIZE = 20;
const SECTION_ACTIVITY_DAYS = 7;
const SECTION_ITEM_CAP = 4;
const RECENT_SPACES_LIMIT = 5;

export default function DashboardWithMemberships({
  dialogState,
  onPendingMembershipsClick,
}: DashboardWithMembershipsProps) {
  const { t } = useTranslation('crd-dashboard');
  const { t: tMain } = useTranslation();
  const navigate = useNavigate();
  const { platformRoles, userModel } = useCurrentUserContext();
  const handleError = useApolloErrorHandler();
  // The raw core.user_settings value: setSettings replaces the whole setting, so a write carries every other key.
  const { data: foundation } = useNativeFoundation();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createVcOpen, setCreateVcOpen] = useState(false);

  // Activity view toggle — persisted per-user in UserSettings.dashboard.activityView.
  // Default: Activity view on (true) when the user has never set it (FR-024). A local
  // override gives the toggle instant feedback ahead of the mutation resolving.
  const userId = userModel?.id;
  const settingActivityView = userModel?.settings?.dashboard?.activityView;
  const [activityOverride, setActivityOverride] = useState<boolean | null>(null);
  const activityEnabled = resolveActivityView(activityOverride, settingActivityView);

  const [saveUserSettings] = useV2DashboardSaveUserSettingsMutation();

  // screens-dispositions.tsv:5213 (L009): setSettings(viewer, 'core', 'user_settings'); the returned actor settings
  // update the foundation viewer in the cache, replacing the legacy UserSettings refetch.
  const persistActivityView = (enabled: boolean) => {
    if (!userId) return;
    const settings = (foundation?.viewer.actor?.settings ?? {}) as { dashboard?: Record<string, unknown> };
    saveUserSettings({
      variables: {
        id: userId,
        value: { ...settings, dashboard: { ...settings.dashboard, activity_view: enabled } },
      },
    }).catch((error: ApolloError) => {
      // Persist failed — drop the local override so the UI falls back to the
      // last-known server value rather than showing a change that didn't save.
      setActivityOverride(null);
      handleError(error);
    });
  };

  const setActivityEnabled = (enabled: boolean) => {
    setActivityOverride(enabled);
    persistActivityView(enabled);
  };

  // Seed-once (FR-026): on the first post-release load with no explicitly-set account
  // preference, migrate a legacy localStorage "SPACES" choice into the setting. An
  // ACTIVITY / unset legacy value already matches the default, so no write is needed.
  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(SEED_FLAG_KEY)) return;
    const legacy = localStorage.getItem(LEGACY_VIEW_KEY);
    if (shouldSeedFromLegacy(legacy, settingActivityView)) {
      setActivityOverride(false);
      persistActivityView(false);
    }
    localStorage.setItem(SEED_FLAG_KEY, '1');
  }, [userId, settingActivityView]);

  // Recent spaces
  const { homeSpaceId, membershipSettingsUrl } = useHomeSpaceSettings();
  const {
    data: recentSpacesData,
    loading: recentSpacesLoading,
    error: recentSpacesError,
  } = useV2DashboardRecentSpacesQuery({ variables: { first: RECENT_SPACES_LIMIT } });
  useReportedQueryError(recentSpacesError);
  // screens-dispositions.tsv:19297: the home space card is Viewer.homeSpace (null without READ on the pinned space).
  const homeSpace = homeSpaceId ? (recentSpacesData?.viewer.homeSpace ?? undefined) : undefined;

  const myRecentSpaces = recentSpacesData?.viewer.recentSpaces ?? [];
  const recentSpacesEmpty = !recentSpacesLoading && myRecentSpaces.length === 0;

  // Memberships — drives the "Explore all" panel, the non-activity Lead & Administer
  // section, and (when the user has no recent contributions) the Recent-spaces fallback.
  const needMemberships = dialogState.openDialog === 'memberships' || !activityEnabled || recentSpacesEmpty;
  const {
    data: myMembershipsData,
    loading: membershipsLoading,
    error: membershipsError,
  } = useV2DashboardMembershipsQuery({ skip: !needMemberships });
  useReportedQueryError(membershipsError);
  const viewerActor = myMembershipsData?.viewer.actor;
  const memberships = viewerActor && 'memberships' in viewerActor ? viewerActor.memberships : [];

  const recentSpaces = (() => {
    // New members with no participation have no recent spaces; fall back to the
    // top-level spaces they're a member of. Subspaces are intentionally NOT included
    // — without activity we only surface the parent spaces, not sub-communities.
    const source: DashboardSpace[] =
      myRecentSpaces.length > 0
        ? myRecentSpaces.map(entry => entry.space)
        : memberships.filter(membership => membership.space.depth === 0).map(membership => membership.space);
    // Show every available space (home space first), not an arbitrary few.
    const filtered = source.filter(space => space.id !== homeSpaceId);
    return mapRecentSpacesToCompactCards(homeSpace ? [homeSpace, ...filtered] : filtered, homeSpaceId);
  })();

  // Non-activity home sections (024)
  const { data: exploreData, error: exploreError } = useV2DashboardMostActiveSpacesQuery({
    variables: { days: SECTION_ACTIVITY_DAYS, first: SECTION_ITEM_CAP },
    skip: activityEnabled,
  });
  useReportedQueryError(exploreError);
  // The sidebar's document (one viewer.account read serves the resources, the host section and the campaign).
  const { data: hostedData, loading: hostedLoading, error: hostedError } = useV2DashboardHostedResourcesQuery();
  useReportedQueryError(hostedError);

  const hostedSpaces = hostedData?.viewer.account?.hosted.spaces ?? [];

  const lastActiveItems = mapLastActiveSection(myRecentSpaces, homeSpace, homeSpaceId);
  const mostActivityItems = mapMostActivitySection(exploreData?.spaces.edges.map(edge => edge.node) ?? []);
  const leadAdminItems = mapLeadAdminSection(memberships);
  const hostItems = mapHostSection(hostedSpaces);
  const hostedPanelItems = mapHostedSpacesToPanelItems(hostedSpaces);

  // Sidebar
  const sidebarData = useDashboardSidebar({
    onInvitationsClick: onPendingMembershipsClick,
    onTipsAndTricksClick: dialogState.openTipsAndTricks,
    onCreateSpaceClick: () => setCreateSpaceOpen(true),
    onMyActivityClick: activityEnabled ? undefined : dialogState.openMyActivity,
    onMySpaceActivityClick: activityEnabled ? undefined : dialogState.openMySpaceActivity,
  });

  // Activity feed data
  const { data: spacesData, error: spacesError } = useV2DashboardFeedSpacesQuery();
  useReportedQueryError(spacesError);
  const flatSpaces = spacesData?.spaces.edges.map(edge => edge.node) ?? [];

  const [spaceActivityFilter, setSpaceActivityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [personalSpaceFilter, setPersonalSpaceFilter] = useState('all');

  const spaceFilterOptions = [
    { value: 'all', label: t('activity.filter.space.all') },
    ...flatSpaces.map(space => ({
      value: space.id,
      label: space.about.displayName,
    })),
  ];

  const roleFilterOptions = [
    { value: 'all', label: t('activity.filter.role.all') },
    { value: RoleName.Member, label: t('activity.filter.role.member') },
    { value: RoleName.Lead, label: t('activity.filter.role.lead') },
    { value: RoleName.Admin, label: t('activity.filter.role.admin') },
  ];

  const isActivityDialogOpen =
    dialogState.openDialog === 'my-activity' || dialogState.openDialog === 'my-space-activity';
  const needsActivityData = activityEnabled || isActivityDialogOpen;

  // Query.activity (L015/L176): no space = the viewer's member spaces and their readable descendants, as legacy's
  // all-spaces list; mine false = others' activity (legacy excludeMyActivity), true = own (legacy myActivity).
  const spaceActivityFilter_ = {
    space: spaceActivityFilter === 'all' ? undefined : spaceActivityFilter,
    roles: roleFilter === 'all' ? undefined : [roleFilter],
    excludeTypes: EXCLUDED_ACTIVITY_TYPES,
    mine: false,
  };

  const personalActivityFilter_ = {
    space: personalSpaceFilter === 'all' ? undefined : personalSpaceFilter,
    excludeTypes: EXCLUDED_ACTIVITY_TYPES,
    mine: true,
  };

  const {
    data: spaceActivityData,
    loading: spaceActivityLoading,
    error: spaceActivityError,
    fetchMore: fetchMoreSpaceActivity,
  } = useV2DashboardActivityQuery({
    variables: { first: ACTIVITY_PAGE_SIZE, ...spaceActivityFilter_ },
    skip: !needsActivityData || flatSpaces.length === 0,
    notifyOnNetworkStatusChange: true,
  });
  // Query.activity is NOT1's: while it is not served, each feed shows its not-available state once, with no toast,
  // retry or fetchMore.
  const spaceActivityUnavailable = isNotServedYet(spaceActivityError);
  useReportedQueryError(spaceActivityUnavailable ? undefined : spaceActivityError);

  const {
    data: personalActivityData,
    loading: personalActivityLoading,
    error: personalActivityError,
    fetchMore: fetchMorePersonalActivity,
  } = useV2DashboardActivityQuery({
    variables: { first: ACTIVITY_PAGE_SIZE, ...personalActivityFilter_ },
    skip: !needsActivityData || flatSpaces.length === 0,
    notifyOnNetworkStatusChange: true,
  });
  const personalActivityUnavailable = isNotServedYet(personalActivityError);
  useReportedQueryError(personalActivityUnavailable ? undefined : personalActivityError);
  const activityUnavailableText = tMain('apollo.errors.userMessages.operations.notAvailableYet');

  const spaceActivityItems = mapNativeActivityToFeedItems(
    spaceActivityData?.activity.edges.map(edge => edge.node) ?? [],
    tMain
  );
  const personalActivityItems = mapNativeActivityToFeedItems(
    personalActivityData?.activity.edges.map(edge => edge.node) ?? [],
    tMain
  );

  const spacePageInfo = spaceActivityData?.activity.pageInfo;
  const personalPageInfo = personalActivityData?.activity.pageInfo;
  const [loadingMoreSpaceActivity, setLoadingMoreSpaceActivity] = useState(false);
  const [loadingMorePersonalActivity, setLoadingMorePersonalActivity] = useState(false);

  const loadMoreSpaceActivity = async () => {
    if (loadingMoreSpaceActivity || !spacePageInfo?.endCursor) return;
    setLoadingMoreSpaceActivity(true);
    try {
      await fetchMoreSpaceActivity({
        variables: { first: ACTIVITY_PAGE_SIZE, after: spacePageInfo.endCursor, ...spaceActivityFilter_ },
      });
    } finally {
      setLoadingMoreSpaceActivity(false);
    }
  };

  const loadMorePersonalActivity = async () => {
    if (loadingMorePersonalActivity || !personalPageInfo?.endCursor) return;
    setLoadingMorePersonalActivity(true);
    try {
      await fetchMorePersonalActivity({
        variables: { first: ACTIVITY_PAGE_SIZE, after: personalPageInfo.endCursor, ...personalActivityFilter_ },
      });
    } finally {
      setLoadingMorePersonalActivity(false);
    }
  };

  // Memberships panel — reuses the same query loaded above.
  const membershipsItems = mapDashboardMemberships(memberships);

  // Campaign (screens-dispositions.tsv:16196)
  const showCampaign =
    isVcCampaignTargeted(platformRoles) && isVcCreationAvailable(hostedData?.viewer.account?.canCreate);

  // Tips — from crd-dashboard namespace
  const tipsRaw = t('tips.items', { returnObjects: true });
  const tipsArray: Array<{ title: string; description: string; imageUrl?: string; url?: string }> = Array.isArray(
    tipsRaw
  )
    ? tipsRaw
    : [];
  const tips = tipsArray.map((item, index) => ({
    id: String(index),
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    href: item.url,
  }));

  return (
    <>
      <DashboardLayout
        sidebar={
          <DashboardSidebar
            menuItems={sidebarData.menuItems}
            resourceSections={sidebarData.resourceSections}
            activityEnabled={activityEnabled}
            onActivityToggle={setActivityEnabled}
          />
        }
      >
        {activityEnabled && (
          <RecentSpaces
            spaces={recentSpaces}
            loading={recentSpacesLoading || (recentSpacesEmpty && membershipsLoading)}
            hasHomeSpace={!!homeSpaceId}
            homeSpaceSettingsHref={membershipSettingsUrl}
            onExploreAllClick={dialogState.openMemberships}
            onPinClick={() => membershipSettingsUrl && navigate(membershipSettingsUrl)}
          />
        )}

        {showCampaign && <CampaignBanner onAction={() => setCreateVcOpen(true)} />}

        {activityEnabled ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed
              variant="spaces"
              feedId="inline-spaces"
              title={t('activity.spacesTitle')}
              items={spaceActivityItems}
              unavailableText={spaceActivityUnavailable ? activityUnavailableText : undefined}
              loading={spaceActivityLoading && spaceActivityItems.length === 0}
              spaceFilter={spaceActivityFilter}
              spaceFilterOptions={spaceFilterOptions}
              onSpaceFilterChange={setSpaceActivityFilter}
              roleFilter={roleFilter}
              roleFilterOptions={roleFilterOptions}
              onRoleFilterChange={setRoleFilter}
              onShowMore={dialogState.openMySpaceActivity}
              maxItems={7}
            />
            <ActivityFeed
              variant="personal"
              feedId="inline-personal"
              title={t('activity.personalTitle')}
              items={personalActivityItems}
              unavailableText={personalActivityUnavailable ? activityUnavailableText : undefined}
              loading={personalActivityLoading && personalActivityItems.length === 0}
              spaceFilter={personalSpaceFilter}
              spaceFilterOptions={spaceFilterOptions}
              onSpaceFilterChange={setPersonalSpaceFilter}
              onShowMore={dialogState.openMyActivity}
              maxItems={7}
            />
          </div>
        ) : (
          <NonActivityHomeSections
            pinnedLastActive={lastActiveItems}
            mostActivity={mostActivityItems}
            leadAdmin={leadAdminItems}
            host={hostItems}
            membershipsItems={membershipsItems}
            hostedPanelItems={hostedPanelItems}
            pinnedLoading={recentSpacesLoading}
            membershipsLoading={membershipsLoading}
            hostedLoading={hostedLoading}
            homeSpaceId={homeSpaceId}
            membershipSettingsUrl={membershipSettingsUrl}
            onNavigate={navigate}
          />
        )}
      </DashboardLayout>
      <CrdCreateSpaceDialog open={createSpaceOpen} onClose={() => setCreateSpaceOpen(false)} />

      <TipsAndTricksDialog
        open={dialogState.openDialog === 'tips-and-tricks'}
        onClose={dialogState.closeDialog}
        tips={tips}
        findMoreHref={t('dialogs.findMoreUrl')}
        findMoreLabel={t('dialogs.findMore')}
      />

      <ActivityDialog
        open={dialogState.openDialog === 'my-activity'}
        onClose={dialogState.closeDialog}
        title={t('activity.personalTitle')}
      >
        <ActivityFeed
          variant="personal"
          feedId="dialog-personal"
          title=""
          items={personalActivityItems}
          unavailableText={personalActivityUnavailable ? activityUnavailableText : undefined}
          loading={personalActivityLoading && personalActivityItems.length === 0}
          spaceFilter={personalSpaceFilter}
          spaceFilterOptions={spaceFilterOptions}
          onSpaceFilterChange={setPersonalSpaceFilter}
          onLoadMore={loadMorePersonalActivity}
          hasMore={personalPageInfo?.hasNextPage ?? false}
          loadingMore={loadingMorePersonalActivity}
          embedded={true}
        />
      </ActivityDialog>

      <ActivityDialog
        open={dialogState.openDialog === 'my-space-activity'}
        onClose={dialogState.closeDialog}
        title={t('activity.spacesTitle')}
      >
        <ActivityFeed
          variant="spaces"
          feedId="dialog-spaces"
          title=""
          items={spaceActivityItems}
          unavailableText={spaceActivityUnavailable ? activityUnavailableText : undefined}
          loading={spaceActivityLoading && spaceActivityItems.length === 0}
          spaceFilter={spaceActivityFilter}
          spaceFilterOptions={spaceFilterOptions}
          onSpaceFilterChange={setSpaceActivityFilter}
          roleFilter={roleFilter}
          roleFilterOptions={roleFilterOptions}
          onRoleFilterChange={setRoleFilter}
          onLoadMore={loadMoreSpaceActivity}
          hasMore={spacePageInfo?.hasNextPage ?? false}
          loadingMore={loadingMoreSpaceActivity}
          embedded={true}
        />
      </ActivityDialog>

      <MyMembershipsPanel
        open={dialogState.openDialog === 'memberships'}
        onClose={dialogState.closeDialog}
        items={membershipsItems}
        loading={membershipsLoading}
        onNavigate={href => {
          dialogState.closeDialog();
          navigate(href);
        }}
        browseAllHref={URL_SPACE_EXPLORER}
      />

      {createVcOpen && <CrdVCCreationWizardDialog open={true} onClose={() => setCreateVcOpen(false)} />}
    </>
  );
}
