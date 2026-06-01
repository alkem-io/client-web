import { Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { Button } from '@/crd/primitives/button';
import {
  DirectMessageDialog,
  type MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { InviteMembersDialogConnector } from '../dialogs/InviteMembersDialogConnector';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';

export default function CrdSpaceCommunityPage() {
  const { t } = useTranslation(['translation', 'crd-space']);
  const { space } = useSpace();
  const navigate = useNavigate();
  const {
    callouts,
    calloutsSetId,
    canCreateCallout,
    canReorderCallouts,
    tabDescription,
    flowStateForNewCallouts,
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

  return (
    <>
      <SpaceSidebarPortal>
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
        />
      </SpaceSidebarPortal>

      <div className="space-y-8">
        <SpaceTabActionHeader
          description={tabDescription}
          action={
            (canCreateCallout || (canInvite && handleInvite)) && (
              <div className="flex items-center gap-2">
                {canInvite && handleInvite && (
                  <Button size="sm" className="gap-2" onClick={handleInvite}>
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    {t('crd-space:members.inviteMember')}
                  </Button>
                )}
                {canCreateCallout && (
                  <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {t('crd-space:feed.addPost')}
                  </Button>
                )}
              </div>
            )
          }
        />

        <SpaceMembers members={members} />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canReorder={canReorderCallouts}
          loading={loading}
        />
      </div>

      {canCreateCallout && (
        <CalloutFormConnector
          open={createOpen}
          onOpenChange={setCreateOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={flowStateForNewCallouts?.displayName}
          defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}
        />
      )}

      {canInvite && <InviteMembersDialogConnector open={inviteOpen} onClose={() => setInviteOpen(false)} />}

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
