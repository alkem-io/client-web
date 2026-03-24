import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActorType,
  AuthorizationPrivilege,
  LicenseEntitlementType,
  RoleName,
  SearchVisibility,
} from '@/core/apollo/generated/graphql-schema';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import type { Identifiable } from '@/core/utils/Identifiable';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import {
  DirectMessageDialog,
  type MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import ContactLeadsButton from '@/domain/community/community/ContactLeadsButton/ContactLeadsButton';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import useCommunityMembersAsCardProps from '@/domain/community/community/utils/useCommunityMembersAsCardProps';
import VirtualContributorsBlock from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock';
import type { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import RoleSetContributorsBlockWide from '@/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWide';
import InviteContributorsWizard from '@/domain/community/inviteContributors/InviteContributorsWizard';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import ExpandableDescription from '@/domain/space/components/ExpandableDescription';
import { SPACE_LAYOUT_EDIT_PATH } from '@/domain/space/constants/spaceEditPaths';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '../../SpaceTabProvider';
import useCurrentTabPosition from '../../useCurrentTabPosition';

const SpaceCommunityPage = () => {
  const { space, entitlements } = useSpace();
  const { about } = space;
  const { t } = useTranslation();
  const { isAuthenticated } = useCurrentUserContext();
  const tabPosition = useCurrentTabPosition();
  const {
    classificationTagsets,
    tabDescription,
    flowStateForNewCallouts: flowStateForTab,
    calloutsSetId,
    canEditInnovationFlow,
  } = useSpaceTabProvider({
    tabPosition,
  });

  const [isContactLeadUsersDialogOpen, setIsContactLeadUsersDialogOpen] = useState(false);
  const openContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(true);
  };
  const closeContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(false);
  };

  const membership = about.membership;
  const communityId = membership?.communityID;
  const communityGuidelinesId = about.guidelines?.id;

  const {
    usersByRole,
    organizationsByRole,
    virtualContributorsByRole,
    myPrivileges,
    loading: roleSetLoading,
  } = useRoleSetManager({
    roleSetId: membership?.roleSetID,
    relevantRoles: [RoleName.Member, RoleName.Lead],
    contributorTypes: [ActorType.User, ActorType.Organization, ActorType.VirtualContributor],
    fetchContributors: true,
  });
  const memberUsers = usersByRole[RoleName.Member];
  const leadUsers = usersByRole[RoleName.Lead];
  const memberOrganizations = organizationsByRole[RoleName.Member];
  const leadOrganizations = organizationsByRole[RoleName.Lead];
  const memberVirtualContributors = virtualContributorsByRole[RoleName.Member];
  const { memberUsers: memberUserCards, memberOrganizations: memberOrganizationCards } = useCommunityMembersAsCardProps(
    { memberUsers, memberOrganizations },
    {
      memberUsersLimit: 0,
      memberOrganizationsLimit: 0,
    }
  );

  // People that can be invited to the community
  const filterInviteeContributors = (contributor: Identifiable) =>
    !(memberUsers ?? []).some(user => user.id === contributor.id);

  const messageReceivers = (leadUsers ?? []).map<MessageReceiverChipData>(user => ({
    id: user.id,
    displayName: user.profile?.displayName ?? '',
    country: user.profile?.location?.country,
    city: user.profile?.location?.city,
    avatarUri: user.profile?.avatar?.uri,
  }));

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const virtualContributors: VirtualContributorProps[] =
    memberVirtualContributors?.filter(vc => vc?.searchVisibility !== SearchVisibility.Hidden) ?? [];

  const hasInvitePrivilege =
    myPrivileges?.some(privilege =>
      [AuthorizationPrivilege.RolesetEntryRoleInvite, AuthorizationPrivilege.CommunityAssignVcFromAccount].includes(
        privilege
      )
    ) ?? false;

  const hasVcSpaceEntitlement = entitlements?.includes(LicenseEntitlementType.SpaceFlagVirtualContributorAccess);
  const showVirtualContributorsBlock = hasVcSpaceEntitlement && (virtualContributors?.length > 0 || hasInvitePrivilege);
  const showInviteOption = hasInvitePrivilege && hasVcSpaceEntitlement;

  const { callouts, canCreateCallout, onCalloutsSortOrderUpdate, refetchCallout, loading } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });
  return (
    <PageContent>
      <InfoColumn>
        {tabDescription && (
          <PageContentBlock accent={true}>
            <ExpandableDescription
              description={tabDescription}
              editPath={SPACE_LAYOUT_EDIT_PATH}
              canEdit={canEditInnovationFlow}
            />
          </PageContentBlock>
        )}
        <EntityDashboardLeadsSection
          usersHeader={t('community.leads')}
          leadUsers={leadUsers}
          leadOrganizations={leadOrganizations}
        />
        <ContactLeadsButton onClick={openContactLeadsDialog}>
          {t('buttons.contactLeads', { contact: t('community.leads') })}
        </ContactLeadsButton>
        {hasInvitePrivilege && (
          <InviteContributorsWizard
            contributorType={ActorType.User}
            sx={{ width: '100%' }}
            filterContributors={filterInviteeContributors}
          />
        )}
        <DirectMessageDialog
          title={t('send-message-dialog.community-message-title', { contact: t('community.host') })}
          open={isContactLeadUsersDialogOpen}
          onClose={closeContactLeadsDialog}
          onSendMessage={sendMessageToCommunityLeads}
          messageReceivers={messageReceivers}
        />
        {showVirtualContributorsBlock && (
          <VirtualContributorsBlock
            virtualContributors={virtualContributors}
            loading={roleSetLoading}
            showInviteOption={showInviteOption}
          />
        )}
        <CommunityGuidelinesBlock communityGuidelinesId={communityGuidelinesId} spaceUrl={about.profile.url} />
      </InfoColumn>
      <ContentColumn>
        <RoleSetContributorsBlockWide
          users={memberUserCards}
          showUsers={isAuthenticated}
          organizations={memberOrganizationCards}
          hasInvitePrivilege={hasInvitePrivilege}
        />
        <CalloutsGroupView
          calloutsSetId={calloutsSetId}
          createInFlowState={flowStateForTab?.displayName}
          callouts={callouts}
          canCreateCallout={canCreateCallout}
          loading={loading}
          onSortOrderUpdate={onCalloutsSortOrderUpdate}
          onCalloutUpdate={refetchCallout}
          defaultTemplateId={flowStateForTab?.defaultCalloutTemplate?.id}
        />
      </ContentColumn>
    </PageContent>
  );
};

SpaceCommunityPage.displayName = 'SpaceCommunityPage';

export default SpaceCommunityPage;
