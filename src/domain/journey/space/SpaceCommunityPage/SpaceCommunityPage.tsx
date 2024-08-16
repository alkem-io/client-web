import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import ContactLeadsButton from '../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { ActivityComponent } from '../../../collaboration/activity/ActivityLog/ActivityComponent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import CommunityContributorsBlockWide from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useSpaceCommunityPageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import {
  ActivityEventType,
  AuthorizationPrivilege,
  CalloutGroupName,
  SearchVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import SpaceCommunityContainer from './SpaceCommunityContainer';
import SpacePageLayout from '../layout/SpacePageLayout';
import { RECENT_ACTIVITIES_LIMIT_EXPANDED } from '../../common/journeyDashboard/constants';
import SeeMore from '../../../../core/ui/content/SeeMore';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import CommunityGuidelinesBlock from '../../../community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import { useSpace } from '../SpaceContext/useSpace';
import InfoColumn from '../../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../../core/ui/content/ContentColumn';
import VirtualContributorsBlock from '../../../community/community/VirtualContributorsBlock/VirtualContributorsBlock';
import { VirtualContributorProps } from '../../../community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { useUserContext } from '../../../community/user';

const SpaceCommunityPage = () => {
  const { spaceNameId } = useUrlParams();
  const { user, isAuthenticated } = useUserContext();
  const { spaceId, journeyPath } = useRouteResolver();
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

  const leadUsers = data?.space.community?.leadUsers;

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

  const spacePrivileges = data?.space.authorization?.myPrivileges ?? [];

  const permissions = {
    readAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const { activities, fetchMoreActivities } = useActivityOnCollaboration(data?.space.collaboration?.id, {
    types: [ActivityEventType.MemberJoined],
    limit: 5,
    skip: !permissions.readAccess || !permissions.readUsers,
  });

  const { memberUsers, memberOrganizations } = useCommunityMembersAsCardProps(data?.space.community, {
    memberUsersLimit: 0,
    memberOrganizationsLimit: 0,
  });

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(data?.space.community?.id);

  const [isActivitiesDialogOpen, setIsActivitiesDialogOpen] = useState(false);

  const hasReadPrivilege = data?.space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);
  let virtualContributors: VirtualContributorProps[] = [];
  if (hasReadPrivilege) {
    virtualContributors =
      data?.space.community?.virtualContributors?.filter(vc => vc?.searchVisibility !== SearchVisibility.Hidden) ?? [];
  }

  useEffect(() => {
    if (isActivitiesDialogOpen) {
      fetchMoreActivities(RECENT_ACTIVITIES_LIMIT_EXPANDED);
    }
  }, [isActivitiesDialogOpen]);

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Community}>
      <SpaceCommunityContainer spaceId={spaceId}>
        {({ callouts }) => (
          <PageContent>
            <InfoColumn>
              <EntityDashboardLeadsSection
                usersHeader={t('community.host')}
                organizationsHeader={t('pages.space.sections.dashboard.organization')}
                leadUsers={leadUsers}
                leadOrganizations={hostOrganizations}
                leadVirtualContributors={undefined}
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
              {hasReadPrivilege && virtualContributors?.length > 0 && (
                <VirtualContributorsBlock virtualContributors={virtualContributors} loading={loading} />
              )}
              <CommunityGuidelinesBlock communityId={communityId} journeyUrl={data?.space.profile.url} />
            </InfoColumn>
            <ContentColumn>
              <CommunityContributorsBlockWide users={memberUsers} organizations={memberOrganizations} />
              {permissions.readAccess && permissions.readUsers && (
                <PageContentBlock>
                  <PageContentBlockHeader title={t('common.activity')} />
                  <Box margin={-1}>
                    <ActivityComponent activities={activities} limit={5} />
                  </Box>
                  <SeeMore subject={t('common.contributions')} onClick={() => setIsActivitiesDialogOpen(true)} />
                  <DialogWithGrid
                    columns={8}
                    open={isActivitiesDialogOpen}
                    onClose={() => setIsActivitiesDialogOpen(false)}
                  >
                    <DialogHeader
                      title={t('components.activity-log-section.title')}
                      onClose={() => setIsActivitiesDialogOpen(false)}
                    />
                    <Box padding={1}>
                      <ActivityComponent activities={activities} />
                    </Box>
                  </DialogWithGrid>
                </PageContentBlock>
              )}
              <CalloutsGroupView
                journeyId={spaceId}
                callouts={callouts.groupedCallouts[CalloutGroupName.Community]}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
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
