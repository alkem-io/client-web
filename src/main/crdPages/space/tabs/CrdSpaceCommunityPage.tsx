import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import InviteContributorsDialog from '@/domain/community/inviteContributors/InviteContributorsDialog';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';

export default function CrdSpaceCommunityPage() {
  const { space } = useSpace();
  const {
    callouts,
    calloutsSetId,
    canCreateCallout,
    tabDescription,
    leadUsers,
    members,
    usersCount,
    organizationsCount,
    canInvite,
    loading,
  } = useCrdSpaceCommunity();

  const [inviteOpen, setInviteOpen] = useState(false);
  const handleInvite = canInvite ? () => setInviteOpen(true) : undefined;

  // Map lead user for sidebar
  const firstLead = leadUsers[0];
  const lead = firstLead?.profile
    ? {
        name: firstLead.profile.displayName,
        avatarUrl: firstLead.profile.avatar?.uri,
        initials: getInitials(firstLead.profile.displayName),
        location: undefined as string | undefined,
        href: firstLead.profile.url,
      }
    : undefined;

  const sidebarContainer = document.getElementById('crd-space-sidebar');

  return (
    <>
      {sidebarContainer &&
        createPortal(
          <SpaceSidebar
            variant="community"
            description={tabDescription || space.about.profile.description || ''}
            lead={lead}
            canInvite={canInvite}
            onInvite={handleInvite}
          />,
          sidebarContainer
        )}

      <div className="space-y-8">
        <SpaceMembers
          members={members}
          usersCount={usersCount}
          organizationsCount={organizationsCount}
          canInvite={canInvite}
          onInvite={handleInvite}
        />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canCreate={canCreateCallout}
          loading={loading}
        />
      </div>

      {canInvite && (
        <InviteContributorsDialog type={ActorType.User} open={inviteOpen} onClose={() => setInviteOpen(false)} />
      )}
    </>
  );
}
