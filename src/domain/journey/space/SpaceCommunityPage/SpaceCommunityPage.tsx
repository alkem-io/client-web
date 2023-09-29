import React, { useEffect, useMemo, useState } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import EntityDashboardLeadsSection from '../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import ContactLeadsButton from '../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { ActivityComponent } from '../../../shared/components/ActivityLog/ActivityComponent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { JourneyLocation } from '../../../../main/routing/urlBuilders';
import CommunityContributorsBlockWide from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useSpaceCommunityPageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { ActivityEventType, CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import SpaceCommunityContainer from './SpaceCommunityContainer';
import SpacePageLayout from '../layout/SpacePageLayout';
import { RECENT_ACTIVITIES_LIMIT_EXPANDED } from '../../common/journeyDashboard/constants';
import SeeMore from '../../../../core/ui/content/SeeMore';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';

const SpaceCommunityPage = () => {
  const { spaceNameId } = useUrlParams();

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

  const journeyLocation: JourneyLocation = { spaceNameId };

  const { data } = useSpaceCommunityPageQuery({
    variables: { spaceNameId },
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

  const hostOrganizations = useMemo(() => data?.space.host && [data?.space.host], [data?.space.host]);

  const { activities, fetchMoreActivities } = useActivityOnCollaboration(data?.space.collaboration?.id, {
    types: [ActivityEventType.MemberJoined],
    limit: 5,
  });

  const { memberUsers, memberOrganizations } = useCommunityMembersAsCardProps(data?.space.community, {
    memberUsersLimit: 0,
    memberOrganizationsLimit: 0,
  });

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(data?.space.community?.id);

  const [isActivitiesDialogOpen, setIsActivitiesDialogOpen] = useState(false);

  useEffect(() => {
    if (isActivitiesDialogOpen) {
      fetchMoreActivities(RECENT_ACTIVITIES_LIMIT_EXPANDED);
    }
  }, [isActivitiesDialogOpen]);

  return (
    <SpacePageLayout currentSection={EntityPageSection.Community}>
      <SpaceCommunityContainer spaceNameId={spaceNameId}>
        {({ callouts }) => (
          <PageContent>
            <PageContentColumn columns={4}>
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
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutDisplayLocation.CommunityLeft]}
                spaceId={spaceNameId!}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                displayLocation={CalloutDisplayLocation.CommunityLeft}
              />
            </PageContentColumn>
            <PageContentColumn columns={8}>
              <CommunityContributorsBlockWide users={memberUsers} organizations={memberOrganizations} />
              <PageContentBlock>
                <PageContentBlockHeader title={t('common.activity')} />
                <ActivityComponent activities={activities} journeyLocation={journeyLocation} limit={5} />
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
                  <Gutters>
                    <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
                  </Gutters>
                </DialogWithGrid>
              </PageContentBlock>
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutDisplayLocation.CommunityRight]}
                spaceId={spaceNameId!}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                displayLocation={CalloutDisplayLocation.CommunityRight}
              />
            </PageContentColumn>
          </PageContent>
        )}
      </SpaceCommunityContainer>
    </SpacePageLayout>
  );
};

export default SpaceCommunityPage;
