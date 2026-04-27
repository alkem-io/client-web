import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { Button } from '@/crd/primitives/button';
import {
  DirectMessageDialog,
  type MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import InviteContributorsDialog from '@/domain/community/inviteContributors/InviteContributorsDialog';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';

export default function CrdSpaceCommunityPage() {
  const { t } = useTranslation(['translation', 'crd-space']);
  const { space } = useSpace();
  const navigate = useNavigate();
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
    canInvite,
    communityId,
    loading,
  } = useCrdSpaceCommunity();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
            description={space.about.profile.description || ''}
            onEditClick={() => navigate(`${space.about.profile.url}/settings/about`)}
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
        <TabStateHeader
          description={tabDescription}
          action={
            canInvite &&
            handleInvite && (
              <Button size="sm" className="gap-2" onClick={handleInvite}>
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                {t('crd-space:members.inviteMember')}
              </Button>
            )
          }
        />

        <SpaceMembers members={members} />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canCreate={canCreateCallout}
          onCreateClick={() => setCreateOpen(true)}
          loading={loading}
        />
      </div>

      {canCreateCallout && (
        <CalloutFormConnector open={createOpen} onOpenChange={setCreateOpen} calloutsSetId={calloutsSetId} />
      )}

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
