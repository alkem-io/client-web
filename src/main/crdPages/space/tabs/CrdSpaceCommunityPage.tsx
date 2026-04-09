import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import type { LeadItem } from '@/crd/components/space/sidebar/LeadBlock';
import {
  DirectMessageDialog,
  type MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import InviteContributorsDialog from '@/domain/community/inviteContributors/InviteContributorsDialog';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';

export default function CrdSpaceCommunityPage() {
  const { t } = useTranslation();
  const { space } = useSpace();
  const {
    callouts,
    calloutsSetId,
    canCreateCallout,
    tabDescription,
    leadUsers,
    leadOrganizations,
    virtualContributors,
    hasVcEntitlement,
    members,
    usersCount,
    organizationsCount,
    canInvite,
    communityId,
    loading,
  } = useCrdSpaceCommunity();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleInvite = canInvite ? () => setInviteOpen(true) : undefined;
  const handleContactLead = () => setContactOpen(true);

  // Merge user + organization leads into a single list for the sidebar.
  const sidebarLeads: LeadItem[] = [...leadUsers, ...leadOrganizations];
  const canContactLeads = leadUsers.length > 0 && Boolean(communityId);

  // Build DirectMessageDialog receiver chips from lead users only — lead
  // organizations are not direct-message targets.
  const messageReceivers: MessageReceiverChipData[] = leadUsers.map(lead => ({
    id: lead.id,
    displayName: lead.name,
    avatarUri: lead.avatarUrl,
  }));

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const sidebarContainer = document.getElementById('crd-space-sidebar');

  return (
    <>
      {sidebarContainer &&
        createPortal(
          <SpaceSidebar
            variant="community"
            description={tabDescription || space.about.profile.description || ''}
            leads={sidebarLeads}
            canContactLeads={canContactLeads}
            onContactLead={handleContactLead}
            canInvite={canInvite}
            onInvite={handleInvite}
            virtualContributors={virtualContributors}
            showVirtualContributors={hasVcEntitlement}
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

      {canContactLeads && (
        <DirectMessageDialog
          title={t('send-message-dialog.community-message-title', { contact: t('community.leads') })}
          open={contactOpen}
          onClose={() => setContactOpen(false)}
          onSendMessage={sendMessageToCommunityLeads}
          messageReceivers={messageReceivers}
        />
      )}
    </>
  );
}
