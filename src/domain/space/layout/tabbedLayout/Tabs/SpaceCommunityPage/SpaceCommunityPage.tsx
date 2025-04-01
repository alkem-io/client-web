import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import PageContent from '@/core/ui/content/PageContent';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import ContactLeadsButton from '@/domain/community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import RoleSetContributorsBlockWide from '@/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWide';
import { useSpaceCommunityPageQuery } from '@/core/apollo/generated/apollo-hooks';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '@/domain/community/community/utils/useCommunityMembersAsCardProps';
import {
  AuthorizationPrivilege,
  LicenseEntitlementType,
  RoleName,
  RoleSetContributorType,
  SearchVisibility,
} from '@/core/apollo/generated/graphql-schema';
import SpacePageLayout from '../../layout/SpacePageLayout';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import VirtualContributorsBlock from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { useUserContext } from '@/domain/community/user';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '../../SpaceTabProvider';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

const SpaceCommunityPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();
  const {
    urlInfo,
    classificationTagsets,
    tabDescription,
    flowStateForNewCallouts: flowStateForTab,
  } = useSpaceTabProvider({
    tabPosition: 1,
  });

  const { spaceId, journeyPath, loading: resolving } = urlInfo;

  if (!spaceId && !resolving) {
    throw new TypeError('Must be within a Space');
  }

  const [isContactLeadUsersDialogOpen, setIsContactLeadUsersDialogOpen] = useState(false);
  const openContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(true);
  };
  const closeContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(false);
  };

  const { data: dataCommunityPage, loading: loadingCommunity } = useSpaceCommunityPageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const spaceData = dataCommunityPage?.lookup.space;
  const membership = spaceData?.about.membership;
  const communityId = membership?.communityID;
  const communityGuidelinesId = dataCommunityPage?.lookup.space?.about.guidelines.id;

  const { usersByRole, organizationsByRole, virtualContributorsByRole, myPrivileges } = useRoleSetManager({
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
  const memberVirtualContributors = virtualContributorsByRole[RoleName.Member];
  const { memberUsers: memberUserCards, memberOrganizations: memberOrganizationCards } = useCommunityMembersAsCardProps(
    { memberUsers, memberOrganizations },
    {
      memberUsersLimit: 0,
      memberOrganizationsLimit: 0,
    }
  );

  const calloutsSetId = spaceData?.collaboration?.calloutsSet?.id;

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

  const hostOrganizations = useMemo(
    () => spaceData?.about.provider && [spaceData.about.provider],
    [spaceData?.about.provider]
  );

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const hasReadPrivilege = spaceData?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);
  let virtualContributors: VirtualContributorProps[] = [];
  if (hasReadPrivilege) {
    virtualContributors =
      memberVirtualContributors?.filter(vc => vc?.searchVisibility !== SearchVisibility.Hidden) ?? [];
  }

  const hasInvitePrivilege = myPrivileges?.some(privilege =>
    [AuthorizationPrivilege.RolesetEntryRoleInvite, AuthorizationPrivilege.CommunityAssignVcFromAccount].includes(
      privilege
    )
  );
  const spaceEntitlements: LicenseEntitlementType[] | undefined = spaceData?.license?.availableEntitlements;
  const hasVcSpaceEntitlement = spaceEntitlements?.includes(LicenseEntitlementType.SpaceFlagVirtualContributorAccess);
  const showVirtualContributorsBlock =
    hasReadPrivilege && hasVcSpaceEntitlement && (virtualContributors?.length > 0 || hasInvitePrivilege);
  const showInviteOption = hasInvitePrivilege && hasVcSpaceEntitlement;

  const { callouts, canCreateCallout, onCalloutsSortOrderUpdate, refetchCallout, loading } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Community}>
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
            leadOrganizations={hostOrganizations}
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
              loading={loadingCommunity}
              showInviteOption={showInviteOption}
            />
          )}
          <CommunityGuidelinesBlock
            communityGuidelinesId={communityGuidelinesId}
            spaceUrl={dataCommunityPage?.lookup.space?.about.profile.url}
          />
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
    </SpacePageLayout>
  );
};

export default SpaceCommunityPage;
