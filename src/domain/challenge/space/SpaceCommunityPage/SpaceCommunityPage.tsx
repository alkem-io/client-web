import React, { useMemo, useState } from 'react';
import { EntityPageLayout } from '../../common/EntityPageLayout';
import SpacePageBanner from '../layout/SpacePageBanner';
import SpaceTabs from '../layout/SpaceTabs';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
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
import { useSpaceCommunityPageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { ActivityEventType, CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutDisplayLocationValuesMap } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';

const SpaceCommunityPage = () => {
  const { spaceNameId } = useUrlParams();

  const { t } = useTranslation();

  if (!spaceNameId) {
    throw new TypeError('Must be within a Space');
  }

  const {
    groupedCallouts,
    canCreateCallout,
    calloutNames,
    loading,
    calloutsSortOrder,
    onCalloutsSortOrderUpdate,
    refetchCallout,
  } = useCallouts({
    spaceNameId,
    calloutGroups: [CalloutDisplayLocation.CommunityLeft, CalloutDisplayLocation.CommunityRight],
  });

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
        avatarUri: user.profile.visual?.uri,
      })),
    [leadUsers]
  );

  const hostOrganizations = useMemo(() => data?.space.host && [data?.space.host], [data?.space.host]);

  const { activities } = useActivityOnCollaboration(data?.space.collaboration?.id, {
    types: [ActivityEventType.MemberJoined],
  });

  const { memberUsers, memberOrganizations } = useCommunityMembersAsCardProps(data?.space.community, {
    memberUsersLimit: 0,
    memberOrganizationsLimit: 0,
  });

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(data?.space.community?.id);

  return (
    <EntityPageLayout
      pageBannerComponent={SpacePageBanner}
      tabsComponent={SpaceTabs}
      currentSection={EntityPageSection.Community}
      entityTypeName="space"
    >
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
            callouts={groupedCallouts[CalloutDisplayLocationValuesMap.CommunityLeft]}
            spaceId={spaceNameId!}
            canCreateCallout={canCreateCallout}
            loading={loading}
            journeyTypeName="space"
            sortOrder={calloutsSortOrder}
            calloutNames={calloutNames}
            onSortOrderUpdate={onCalloutsSortOrderUpdate}
            onCalloutUpdate={refetchCallout}
            group={CalloutDisplayLocation.CommunityLeft}
          />
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <CommunityContributorsBlockWide users={memberUsers} organizations={memberOrganizations} />
          <PageContentBlock>
            <PageContentBlockHeader title={t('common.activity')} />
            <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
          </PageContentBlock>
          <CalloutsGroupView
            callouts={groupedCallouts[CalloutDisplayLocationValuesMap.CommunityRight]}
            spaceId={spaceNameId!}
            canCreateCallout={canCreateCallout}
            loading={loading}
            journeyTypeName="space"
            sortOrder={calloutsSortOrder}
            calloutNames={calloutNames}
            onSortOrderUpdate={onCalloutsSortOrderUpdate}
            onCalloutUpdate={refetchCallout}
            group={CalloutDisplayLocation.CommunityRight}
          />
        </PageContentColumn>
      </PageContent>
    </EntityPageLayout>
  );
};

export default SpaceCommunityPage;
