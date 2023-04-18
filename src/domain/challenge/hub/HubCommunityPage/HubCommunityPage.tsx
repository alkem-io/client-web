import React, { useMemo, useState } from 'react';
import { EntityPageLayout } from '../../common/EntityPageLayout';
import HubPageBanner from '../layout/HubPageBanner';
import HubTabs from '../layout/HubTabs';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
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
import { ActivityComponent } from '../../../shared/components/ActivityLog';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import CommunityContributorsBlockWide from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useHubCommunityPageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';

const HubCommunityPage = () => {
  const { hubNameId } = useUrlParams();

  const { t } = useTranslation();

  if (!hubNameId) {
    throw new TypeError('Must be within a Hub');
  }

  const { groupedCallouts, canCreateCallout, calloutNames, loading, calloutsSortOrder, onCalloutsSortOrderUpdate } =
    useCallouts({
      hubNameId,
      calloutGroups: [CalloutsGroup.HomeLeft, CalloutsGroup.HomeRight],
    });

  const [isContactLeadUsersDialogOpen, setIsContactLeadUsersDialogOpen] = useState(false);
  const openContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(true);
  };
  const closeContactLeadsDialog = () => {
    setIsContactLeadUsersDialogOpen(false);
  };

  const journeyLocation: JourneyLocation = { hubNameId };

  const { data } = useHubCommunityPageQuery({
    variables: { hubNameId },
  });

  const leadUsers = data?.hub.community?.leadUsers;

  const messageReceivers = useMemo(
    () =>
      (leadUsers ?? []).map<MessageReceiverChipData>(user => ({
        id: user.id,
        title: user.profile.displayName,
        country: user.profile.location?.country,
        city: user.profile.location?.city,
        avatarUri: user.profile.visual?.uri,
      })),
    [leadUsers]
  );

  const hostOrganizations = useMemo(() => data?.hub.host && [data?.hub.host], [data?.hub.host]);

  const { activities } = useActivityOnCollaboration(data?.hub.collaboration?.id);

  const relevantActivities = activities?.filter(activityItem => {
    return activityItem.__typename === 'ActivityLogEntryMemberJoined';
  });

  const { memberUsers, memberOrganizations } = useCommunityMembersAsCardProps(data?.hub.community);

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(data?.hub.community?.id);

  return (
    <EntityPageLayout
      pageBannerComponent={HubPageBanner}
      tabsComponent={HubTabs}
      currentSection={EntityPageSection.Community}
      entityTypeName="hub"
    >
      <PageContent>
        <PageContentColumn columns={4}>
          <EntityDashboardLeadsSection
            usersHeader={t('community.host')}
            organizationsHeader={t('pages.hub.sections.dashboard.organization')}
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
            callouts={groupedCallouts[CalloutsGroup.CommunityLeft]}
            hubId={hubNameId!}
            canCreateCallout={canCreateCallout}
            loading={loading}
            entityTypeName="hub"
            sortOrder={calloutsSortOrder}
            calloutNames={calloutNames}
            onSortOrderUpdate={onCalloutsSortOrderUpdate}
          />
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <CommunityContributorsBlockWide users={memberUsers} organizations={memberOrganizations} />
          <PageContentBlock>
            <PageContentBlockHeader title={t('common.activity')} />
            <ActivityComponent activities={relevantActivities} journeyLocation={journeyLocation} />
          </PageContentBlock>
          <CalloutsGroupView
            callouts={groupedCallouts[CalloutsGroup.CommunityRight]}
            hubId={hubNameId!}
            canCreateCallout={canCreateCallout}
            loading={loading}
            entityTypeName="hub"
            sortOrder={calloutsSortOrder}
            calloutNames={calloutNames}
            onSortOrderUpdate={onCalloutsSortOrderUpdate}
          />
        </PageContentColumn>
      </PageContent>
    </EntityPageLayout>
  );
};

export default HubCommunityPage;
