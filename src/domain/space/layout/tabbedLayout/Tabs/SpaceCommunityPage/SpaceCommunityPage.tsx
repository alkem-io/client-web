import { useCallback, useMemo, useState } from 'react';
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
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '../../SpaceTabProvider';
import useCurrentTabPosition from '../../useCurrentTabPosition';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useSpace } from '@/domain/space/context/useSpace';
import { SPACE_LAYOUT_EDIT_PATH } from '@/domain/space/constants/spaceEditPaths';
import ExpandableDescription from '@/domain/space/components/ExpandableDescription';
import InviteContributorsWizard from '@/domain/community/inviteContributors/InviteContributorsWizard';
import { Identifiable } from '@/core/utils/Identifiable';

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

  // People that can be invited to the community
  const filterInviteeContributors = useCallback(
    (contributor: Identifiable) => !(memberUsers ?? []).some(user => user.id === contributor.id),
    [memberUsers]
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
          <PageContentBlock accent>
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
            contributorType={RoleSetContributorType.User}
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
        />
      </ContentColumn>
    </PageContent>
  );
};

SpaceCommunityPage.displayName = 'SpaceCommunityPage';

export default SpaceCommunityPage;
