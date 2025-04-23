import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import ContactLeadsButton from '@/domain/community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import RoleSetContributorsBlockWide from '@/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWide';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '@/domain/community/community/utils/useCommunityMembersAsCardProps';
import {
  AuthorizationPrivilege,
  LicenseEntitlementType,
  RoleName,
  RoleSetContributorType,
  SearchVisibility,
} from '@/core/apollo/generated/graphql-schema';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import VirtualContributorsBlock from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { useCurrentUserContext } from '@/domain/community/user';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '../../SpaceTabProvider';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useSpace } from '@/domain/space/context/useSpace';

const SpaceCommunityPage = () => {
  const { space, entitlements } = useSpace();
  const { about } = space;
  const { t } = useTranslation();
  const { isAuthenticated } = useCurrentUserContext();
  const {
    classificationTagsets,
    tabDescription,
    flowStateForNewCallouts: flowStateForTab,
    calloutsSetId,
  } = useSpaceTabProvider({
    tabPosition: 1,
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
    contributorTypes: [
      RoleSetContributorType.User,
      RoleSetContributorType.Organization,
      RoleSetContributorType.Virtual,
    ],
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

  const messageReceivers = useMemo(
    () =>
      (leadUsers ?? []).map<MessageReceiverChipData>(user => ({
        id: user.id,
        displayName: user.profile.displayName,
        country: user.profile.location?.country,
        city: user.profile.location?.city,
        avatarUri: user.profile.avatar?.uri,
      })),
    [leadUsers]
  );

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  let virtualContributors: VirtualContributorProps[] =
    memberVirtualContributors?.filter(vc => vc?.searchVisibility !== SearchVisibility.Hidden) ?? [];

  const hasInvitePrivilege = myPrivileges?.some(privilege =>
    [AuthorizationPrivilege.RolesetEntryRoleInvite, AuthorizationPrivilege.CommunityAssignVcFromAccount].includes(
      privilege
    )
  );

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
          <PageContentBlock accent>
            <WrapperMarkdown>{tabDescription}</WrapperMarkdown>
          </PageContentBlock>
        )}
        <EntityDashboardLeadsSection
          usersHeader={t('community.leads')}
          organizationsHeader={t('pages.space.sections.dashboard.organization')}
          leadUsers={leadUsers}
          leadOrganizations={leadOrganizations}
        />
        <ContactLeadsButton onClick={openContactLeadsDialog}>
          {t('buttons.contact-leads', { contact: t('community.host') })}
        </ContactLeadsButton>
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
        />
        <CalloutsGroupView
          calloutsSetId={calloutsSetId}
          createInFlowState={flowStateForTab?.displayName}
          callouts={callouts}
          canCreateCallout={canCreateCallout}
          loading={loading}
          onSortOrderUpdate={onCalloutsSortOrderUpdate}
          onCalloutUpdate={refetchCallout}
        />
      </ContentColumn>
    </PageContent>
  );
};

SpaceCommunityPage.displayName = 'SpaceCommunityPage';

export default SpaceCommunityPage;
