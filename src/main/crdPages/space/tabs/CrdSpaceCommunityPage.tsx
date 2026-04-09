import { createPortal } from 'react-dom';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';

export default function CrdSpaceCommunityPage() {
  const { space } = useSpace();
  const { callouts, calloutsSetId, canCreateCallout, tabDescription, leadUsers, members, canInvite, loading } =
    useCrdSpaceCommunity();

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
          />,
          sidebarContainer
        )}

      <div className="space-y-8">
        <SpaceMembers members={members} />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canCreate={canCreateCallout}
          loading={loading}
        />
      </div>
    </>
  );
}
