import { Layers } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { SubspaceHeader } from '@/crd/components/space/SubspaceHeader';
import { type SubspaceQuickActionId, SubspaceSidebar } from '@/crd/components/space/SubspaceSidebar';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { CrdSubspaceAboutDialogConnector } from '../dialogs/CrdSubspaceAboutDialogConnector';
import { CrdSubspaceActivityDialogConnector } from '../dialogs/CrdSubspaceActivityDialogConnector';
import { CrdSubspaceCommunityDialogConnector } from '../dialogs/CrdSubspaceCommunityDialogConnector';
import { CrdSubspaceEventsDialogConnector } from '../dialogs/CrdSubspaceEventsDialogConnector';
import { CrdSubspaceIndexDialogConnector } from '../dialogs/CrdSubspaceIndexDialogConnector';
import { CrdSubspaceSubspacesDialogConnector } from '../dialogs/CrdSubspaceSubspacesDialogConnector';
import { useCrdSubspace } from '../hooks/useCrdSubspace';

export default function CrdSubspacePageLayout() {
  const data = useCrdSubspace();
  const [activeDialog, setActiveDialog] = useState<SubspaceQuickActionId | null>(null);
  const [communityFromBanner, setCommunityFromBanner] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Breadcrumbs render the full ancestor chain. At L1 the L0 hop is the same as the
  // parent — collapse to a single hop. At L2 the L0 hop is distinct, so we render
  // L0 → L1 → L2.
  const includeL0Crumb =
    !!data.levelZeroSpaceName && !!data.levelZeroSpaceId && data.levelZeroSpaceId !== data.parentSpaceId;
  useSetBreadcrumbs(
    data.parentSpaceName && data.subspaceName
      ? [
          ...(includeL0Crumb ? [{ label: data.levelZeroSpaceName!, href: data.levelZeroSpaceUrl, icon: Layers }] : []),
          { label: data.parentSpaceName, href: data.parentSpaceUrl, icon: Layers },
          { label: data.subspaceName },
        ]
      : []
  );

  if (data.loading) {
    return <LoadingSpinner />;
  }

  if (data.notFound) {
    return null;
  }

  const communityOpen = communityFromBanner || activeDialog === 'community';

  const handleCommunityChange = (open: boolean) => {
    if (open) {
      // Banner click — keep activeDialog separate so closing one doesn't toggle the other.
      setCommunityFromBanner(true);
    } else {
      setCommunityFromBanner(false);
      if (activeDialog === 'community') setActiveDialog(null);
    }
  };

  const handleQuickAction = (id: SubspaceQuickActionId) => {
    setActiveDialog(id);
  };

  const showApplyCta = !data.applicationButtonProps.isMember && !data.applicationLoading;

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
          onMemberClick={() => handleCommunityChange(true)}
        />

        <main className="flex-1 w-full px-6 md:px-8 py-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left sidebar — cols 2-3, one col gap from left edge */}
            <div className="hidden lg:block lg:col-start-2 col-span-2 sticky top-24 self-start">
              <SubspaceSidebar
                {...data.sidebar}
                onAboutClick={() => setAboutOpen(true)}
                onQuickActionClick={handleQuickAction}
              />
            </div>

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
                <Outlet context={{ data }} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* Community dialog — opened from banner avatar stack OR sidebar Quick Action */}
      <CrdSubspaceCommunityDialogConnector
        open={communityOpen}
        onOpenChange={handleCommunityChange}
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
