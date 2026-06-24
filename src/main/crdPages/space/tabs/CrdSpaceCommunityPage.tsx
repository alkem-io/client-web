import { Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import type { ContactLeadRecipient } from '@/crd/components/chat/ContactLeadsDialog';
import { CommunityGuidelinesBlock } from '@/crd/components/space/CommunityGuidelinesBlock';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { Button } from '@/crd/primitives/button';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { ContactLeadsDialogConnector } from '../dialogs/ContactLeadsDialogConnector';
import { InviteMembersDialogConnector } from '../dialogs/InviteMembersDialogConnector';
import { VirtualContributorInviteConnector } from '../dialogs/VirtualContributorInviteConnector';
import { useCrdSpaceCommunity } from '../hooks/useCrdSpaceCommunity';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';

export default function CrdSpaceCommunityPage() {
  const { t } = useTranslation(['crd-common', 'crd-space']);
  const { space, permissions } = useSpace();
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
    roleSetId,
    guidelines,
    loading,
  } = useCrdSpaceCommunity();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [vcInviteOpen, setVcInviteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const handleInvite = canInvite ? () => setInviteOpen(true) : undefined;
  // VC invite is gated on the VC entitlement + the same admin (canUpdate) gate as
  // member invites, and needs a resolved role set to mutate against.
  const canInviteVc = hasVcEntitlement && canInvite && Boolean(roleSetId);
  const handleInviteVc = canInviteVc ? () => setVcInviteOpen(true) : undefined;
  const handleContactLead = () => setContactOpen(true);

  // Merge user + organization leads into a single list for the sidebar.
  const sidebarLeads: LeadItem[] = [...leadUsers, ...leadOrganizations];
  const canContactLeads = leadUsers.length > 0 && Boolean(communityId);

  // Build chat recipients from lead users only — lead organizations are not
  // direct-message targets (org contact stays email, FR-009).
  const leadRecipients: ContactLeadRecipient[] = leadUsers.map(lead => ({
    id: lead.id,
    displayName: lead.name,
    avatarUrl: lead.avatarUrl,
  }));

  const guidelinesSlot = guidelines.id ? (
    <CommunityGuidelinesBlock
      displayName={guidelines.displayName}
      description={guidelines.description}
      references={guidelines.references}
      loading={guidelines.loading}
      canEdit={permissions.canUpdate}
      onEditClick={() => navigate(`${buildSettingsUrl(space.about.profile.url)}/community#guidelines`)}
    />
  ) : undefined;

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar
          variant="community"
          description={space.about.profile.description || ''}
          onEditClick={permissions.canUpdate ? () => navigate(`${space.about.profile.url}/settings/about`) : undefined}
          leads={sidebarLeads}
          canContactLeads={canContactLeads}
          onContactLead={handleContactLead}
          canInvite={canInvite}
          onInvite={handleInvite}
          virtualContributors={virtualContributors}
          showVirtualContributors={hasVcEntitlement}
          onVirtualContributorClick={href => navigate(href)}
          onInviteVc={handleInviteVc}
          guidelinesSlot={guidelinesSlot}
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

      {canContactLeads && (
        <ContactLeadsDialogConnector open={contactOpen} onOpenChange={setContactOpen} recipients={leadRecipients} />
      )}
    </>
  );
}
