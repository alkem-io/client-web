import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import PageContent from '@/core/ui/content/PageContent';
import { useUrlParams } from '@/core/routing/useUrlParams';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import EntityDashboardLeadsSection from '@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import ContactLeadsButton from '@/domain/community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import CommunityContributorsBlockWide from '@/domain/community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useSpaceCommunityPageQuery } from '@/core/apollo/generated/apollo-hooks';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '@/domain/community/community/utils/useCommunityMembersAsCardProps';
import { AuthorizationPrivilege, CalloutGroupName, SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import SpaceCommunityContainer from './SpaceCommunityContainer';
import SpacePageLayout from '../layout/SpacePageLayout';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import { useSpace } from '../SpaceContext/useSpace';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import VirtualContributorsBlock from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { useUserContext } from '@/domain/community/user';

const SpaceCommunityPage = () => {
  const { spaceNameId } = useUrlParams();
  const { isAuthenticated } = useUserContext();
  const { spaceId, collaborationId, journeyPath } = useRouteResolver();
  const { communityId } = useSpace();

  const { t } = useTranslation();

  if (!spaceNameId) {
    throw new TypeError('Must be within a Space');
  }

  const [isContactLeadUsersDialogOpen, setIsContactLeadUsersDialogOpen] = useState(false);
  const openContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(true);
  };
  const closeContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(false);
  };

  const { data, loading } = useSpaceCommunityPageQuery({
    variables: { spaceNameId, includeCommunity: isAuthenticated },
  });

  const leadUsers = data?.space.community?.roleSet?.leadUsers;
  const calloutsSetId = data?.space.collaboration?.calloutsSet?.id;

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

  const hostOrganizations = useMemo(() => data?.space.provider && [data.space.provider], [data?.space.provider]);

  const { memberUsers, memberOrganizations } = useCommunityMembersAsCardProps(data?.space.community?.roleSet, {
    memberUsersLimit: 0,
    memberOrganizationsLimit: 0,
  });

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(data?.space.community?.id);

  const hasReadPrivilege = data?.space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);
  let virtualContributors: VirtualContributorProps[] = [];
  if (hasReadPrivilege) {
    virtualContributors =
      data?.space.community?.roleSet?.memberVirtualContributors?.filter(
        vc => vc?.searchVisibility !== SearchVisibility.Hidden
      ) ?? [];
  }

  const hasInvitePrivilege = data?.space.community?.roleSet.authorization?.myPrivileges?.some(privilege =>
    [AuthorizationPrivilege.CommunityInvite, AuthorizationPrivilege.CommunityAddMemberVcFromAccount].includes(privilege)
  );

  const showVirtualContributorsBlock = hasReadPrivilege && (virtualContributors?.length > 0 || hasInvitePrivilege);

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Community}>
      <SpaceCommunityContainer collaborationId={collaborationId}>
        {({ callouts }) => (
          <PageContent>
            <InfoColumn>
              <EntityDashboardLeadsSection
                usersHeader={t('community.host')}
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
                  loading={loading}
                  showInviteOption={hasInvitePrivilege}
                />
              )}
              <CommunityGuidelinesBlock communityId={communityId} journeyUrl={data?.space.profile.url} />
            </InfoColumn>
            <ContentColumn>
              <CommunityContributorsBlockWide users={memberUsers} organizations={memberOrganizations} />
              <CalloutsGroupView
                journeyId={spaceId}
                calloutsSetId={calloutsSetId}
                callouts={callouts.groupedCallouts[CalloutGroupName.Community]}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                groupName={CalloutGroupName.Community}
              />
            </ContentColumn>
          </PageContent>
        )}
      </SpaceCommunityContainer>
    </SpacePageLayout>
  );
};

export default SpaceCommunityPage;
