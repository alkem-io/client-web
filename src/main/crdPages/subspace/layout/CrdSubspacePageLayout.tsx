import { Layers, Layout as LayoutIcon } from 'lucide-react';
import { type ReactNode, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { SubspaceHeader } from '@/crd/components/space/SubspaceHeader';
import { type SubspaceQuickActionId, SubspaceSidebar } from '@/crd/components/space/SubspaceSidebar';
import { SpaceSettingsHeader } from '@/crd/components/space/settings/SpaceSettingsHeader';
import { SpaceSettingsTabStrip } from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import { useSpaceSettingsTab } from '@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab';
import {
  getVisibleSettingsTabs,
  useSettingsTabDescriptors,
} from '@/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { CrdSpaceCommunityDialogConnector } from '../../space/dialogs/CrdSpaceCommunityDialogConnector';
import { CrdSubspaceAboutDialogConnector } from '../dialogs/CrdSubspaceAboutDialogConnector';
import { CrdSubspaceActivityDialogConnector } from '../dialogs/CrdSubspaceActivityDialogConnector';
import { CrdSubspaceEventsDialogConnector } from '../dialogs/CrdSubspaceEventsDialogConnector';
import { CrdSubspaceIndexDialogConnector } from '../dialogs/CrdSubspaceIndexDialogConnector';
import { CrdSubspaceSubspacesDialogConnector } from '../dialogs/CrdSubspaceSubspacesDialogConnector';
import { useCrdSubspace } from '../hooks/useCrdSubspace';

export type SubspaceMobileMenu = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ReactNode;
};

export type SubspaceOutletContext = {
  data: ReturnType<typeof useCrdSubspace>;
  mobileMenu: SubspaceMobileMenu;
};

export default function CrdSubspacePageLayout() {
  const data = useCrdSubspace();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { spaceLevel } = useUrlResolver();
  const { t } = useTranslation(['crd-spaceSettings', 'crd-subspace']);
  const [activeDialog, setActiveDialog] = useState<SubspaceQuickActionId | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOnSettings = pathname.includes('/settings');
  const settingsLevel: 'L1' | 'L2' = spaceLevel === SpaceLevel.L2 ? 'L2' : 'L1';
  const visibleSettingsTabs = getVisibleSettingsTabs(settingsLevel);
  const settingsTabDescriptors = useSettingsTabDescriptors(settingsLevel);
  const { activeTab: activeSettingsTab, setActiveTab: setActiveSettingsTab } = useSpaceSettingsTab(visibleSettingsTabs);

  // Breadcrumbs render the full ancestor chain. At L1 the L0 hop is the same as the
  // parent — collapse to a single hop. At L2 the L0 hop is distinct, so we render
  // L0 → L1 → L2. On `/settings` we additionally append a Settings hop and the
  // active tab label, mirroring the L0 settings breadcrumb shape.
  const includeL0Crumb =
    !!data.levelZeroSpaceName && !!data.levelZeroSpaceId && data.levelZeroSpaceId !== data.parentSpaceId;
  const baseTrail =
    data.parentSpaceName && data.subspaceName
      ? [
          ...(includeL0Crumb ? [{ label: data.levelZeroSpaceName!, href: data.levelZeroSpaceUrl, icon: Layers }] : []),
          { label: data.parentSpaceName, href: data.parentSpaceUrl, icon: Layers },
          {
            label: data.subspaceName,
            ...(isOnSettings ? { href: data.subspaceUrl, icon: Layers } : {}),
          },
        ]
      : [];
  const settingsTrail = isOnSettings
    ? [{ label: t('tabs.settings'), href: `${data.subspaceUrl}/settings` }, { label: t(`tabs.${activeSettingsTab}`) }]
    : [];
  useSetBreadcrumbs(baseTrail.length > 0 ? [...baseTrail, ...settingsTrail] : []);

  if (data.loading) {
    return <LoadingSpinner />;
  }

  if (data.notFound) {
    return null;
  }

  const handleQuickAction = (id: SubspaceQuickActionId) => {
    setMobileMenuOpen(false);
    setActiveDialog(id);
  };

  const editFlowHref = data.subspaceUrl ? `${data.subspaceUrl}/settings/layout` : undefined;

  const subspaceSidebar = (
    <SubspaceSidebar
      {...data.sidebar}
      onEditClick={() => navigate(`${data.subspaceUrl}/settings/about`)}
      onAboutClick={() => setAboutOpen(true)}
      onQuickActionClick={handleQuickAction}
    />
  );

  const mobileMenuContent = (
    <div className="flex flex-col gap-4">
      {subspaceSidebar}
      {data.canEditFlow && editFlowHref && (
        <a
          href={editFlowHref}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-control font-medium text-foreground border-t border-border pt-4 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMobileMenuOpen(false)}
        >
          <LayoutIcon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {t('crd-subspace:flow.editFlow')}
        </a>
      )}
    </div>
  );

  const mobileMenu: SubspaceMobileMenu = {
    open: mobileMenuOpen,
    onOpenChange: setMobileMenuOpen,
    content: mobileMenuContent,
  };

  const showApplyCta = !data.applicationButtonProps.isMember && !data.applicationLoading;

  if (isOnSettings) {
    return (
      <>
        {data.visibility.status !== 'active' && (
          <SpaceVisibilityNotice status={data.visibility.status} contactHref={data.visibility.contactHref} />
        )}
        <div className="flex flex-col bg-background min-h-screen">
          <SpaceSettingsHeader
            title={data.banner.title}
            tagline={data.banner.tagline ?? null}
            avatarUrl={data.banner.subspaceAvatarUrl ?? null}
            initials={data.banner.subspaceInitials}
            avatarColor={data.banner.subspaceColor}
            tabs={
              <SpaceSettingsTabStrip
                activeTab={activeSettingsTab}
                onTabChange={setActiveSettingsTab}
                tabs={settingsTabDescriptors}
              />
            }
          />
          <main className="flex-1 w-full px-6 md:px-8 py-8">
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-12 lg:col-start-2 lg:col-span-10 min-w-0">
                <Suspense fallback={<LoadingSpinner />}>
                  <Outlet context={{ data }} />
                </Suspense>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      {data.visibility.status !== 'active' && (
        <SpaceVisibilityNotice status={data.visibility.status} contactHref={data.visibility.contactHref} />
      )}

      <div className="flex flex-col bg-background min-h-screen">
        <SubspaceHeader
          {...data.banner}
          actions={{
            ...data.bannerActions,
            onActivityClick: () => setActiveDialog('activity'),
          }}
          memberAvatars={data.bannerAvatars}
          onMemberClick={() => setActiveDialog('community')}
        />

        <main className="flex-1 w-full px-6 md:px-8 py-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left sidebar — cols 2-3, one col gap from left edge */}
            <div className="hidden lg:block lg:col-start-2 col-span-2 sticky top-24 self-start">{subspaceSidebar}</div>

            {/* Main content — cols 4-11, one col gap from right edge (matches banner action row) */}
            <div className="col-span-12 lg:col-start-4 lg:col-span-8 min-w-0 space-y-6">
              {showApplyCta && (
                <SpaceAboutApplyButton
                  isAuthenticated={data.applicationButtonProps.isAuthenticated}
                  isMember={data.applicationButtonProps.isMember}
                  isParentMember={data.applicationButtonProps.isParentMember}
                  applicationState={data.applicationButtonProps.applicationState}
                  userInvitation={data.applicationButtonProps.userInvitation}
                  parentApplicationState={data.applicationButtonProps.parentApplicationState}
                  canJoinCommunity={data.applicationButtonProps.canJoinCommunity}
                  canAcceptInvitation={data.applicationButtonProps.canAcceptInvitation}
                  canApplyToCommunity={data.applicationButtonProps.canApplyToCommunity}
                  canJoinParentCommunity={data.applicationButtonProps.canJoinParentCommunity}
                  canApplyToParentCommunity={data.applicationButtonProps.canApplyToParentCommunity}
                  loading={data.applicationButtonProps.loading || data.applicationLoading}
                />
              )}

              <Suspense fallback={<LoadingSpinner />}>
                <Outlet context={{ data, mobileMenu }} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* Community dialog — opened from banner avatar stack OR sidebar Quick Action */}
      <CrdSpaceCommunityDialogConnector
        open={activeDialog === 'community'}
        onOpenChange={open => setActiveDialog(open ? 'community' : null)}
        roleSetId={data.roleSetId}
      />

      <CrdSubspaceEventsDialogConnector
        open={activeDialog === 'events'}
        onOpenChange={open => setActiveDialog(open ? 'events' : null)}
      />

      <CrdSubspaceActivityDialogConnector
        open={activeDialog === 'activity'}
        onOpenChange={open => setActiveDialog(open ? 'activity' : null)}
        subspaceId={data.subspaceId}
      />

      <CrdSubspaceIndexDialogConnector
        open={activeDialog === 'index'}
        onOpenChange={open => setActiveDialog(open ? 'index' : null)}
        calloutsSetId={data.calloutsSetId}
      />

      <CrdSubspaceSubspacesDialogConnector
        open={activeDialog === 'subspaces'}
        onOpenChange={open => setActiveDialog(open ? 'subspaces' : null)}
        subspaceId={data.subspaceId}
      />

      <CrdSubspaceAboutDialogConnector open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
