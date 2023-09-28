import React, { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutDisplayLocation,
  CalloutsQueryVariables,
  Reference,
} from '../../../../../core/apollo/generated/graphql-schema';
import { buildJourneyUrl, JourneyLocation } from '../../../../../main/routing/urlBuilders';
import EntityDashboardContributorsSection from '../../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import DashboardUpdatesSection from '../../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { ActivityLogResultType } from '../../../../shared/components/ActivityLog/ActivityComponent';
import ShareButton from '../../../../shared/components/ShareDialog/ShareButton';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { CoreEntityIdTypes } from '../../../../shared/types/CoreEntityIds';
import { JourneyTypeName } from '../../../JourneyTypeName';
import DashboardCalendarSection from '../../../../shared/components/DashboardSections/DashboardCalendarSection';
import ContactLeadsButton from '../../../../community/community/ContactLeadsButton/ContactLeadsButton';
import {
  DirectMessageDialog,
  MessageReceiverChipData,
} from '../../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import CalloutsGroupView from '../../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../../collaboration/callout/useCallouts/useCallouts';
import DashboardRecentContributionsBlock, {
  DashboardRecentContributionsBlockProps,
} from '../../dashboardRecentContributionsBlock/DashboardRecentContributionsBlock';
import FullWidthButton from '../../../../../core/ui/button/FullWidthButton';
import { InfoOutlined } from '@mui/icons-material';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import ApplicationButtonContainer from '../../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../community/application/applicationButton/ApplicationButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material';

export interface JourneyDashboardViewProps
  extends EntityDashboardContributors,
    Omit<EntityDashboardLeads, 'leadOrganizations'>,
    Partial<CoreEntityIdTypes> {
  welcome?: ReactNode;
  communityId?: string;
  organization?: unknown;
  references: Reference[] | undefined;
  community?: unknown;
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  journeyTypeName: JourneyTypeName;
  topCallouts: DashboardRecentContributionsBlockProps['topCallouts'];
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  callouts: {
    groupedCallouts: Record<CalloutDisplayLocation, TypedCallout[] | undefined>;
    canCreateCallout: boolean;
    calloutNames: string[];
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
  enableJoin?: boolean;
}

const JourneyDashboardView = ({
  welcome,
  spaceNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  callouts,
  topCallouts,
  communityReadAccess = false,
  timelineReadAccess = false,
  entityReadAccess,
  readUsersAccess,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
  leadUsers,
  activities,
  activityLoading,
  journeyTypeName,
  sendMessageToCommunityLeads,
  enableJoin = false,
}: JourneyDashboardViewProps) => {
  const { t } = useTranslation();
  const [isOpenContactLeadUsersDialog, setIsOpenContactLeadUsersDialog] = useState(false);
  const openContactLeadsDialog = () => {
    setIsOpenContactLeadUsersDialog(true);
  };
  const closeContactLeadsDialog = () => {
    setIsOpenContactLeadUsersDialog(false);
  };

  const journeyLocation: JourneyLocation | undefined =
    typeof spaceNameId === 'undefined'
      ? undefined
      : {
          spaceNameId,
          challengeNameId,
          opportunityNameId,
        };

  const isSpace = journeyTypeName === 'space';

  const leadUsersHeader = isSpace ? 'community.host' : 'community.leads';

  const contactLeadsMessageReceivers = useMemo(
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

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  return (
    <PageContent>
      {enableJoin && (
        <ApplicationButtonContainer>
          {({ applicationButtonProps }, { loading }) => {
            if (loading || applicationButtonProps.isMember) {
              return null;
            }

            return (
              <PageContentColumn columns={12}>
                <ApplicationButton
                  {...applicationButtonProps}
                  loading={loading}
                  component={FullWidthButton}
                  extended={hasExtendedApplicationButton}
                  journeyTypeName={journeyTypeName}
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>
      )}
      <PageContentColumn columns={4}>
        {welcome}
        <FullWidthButton
          startIcon={<InfoOutlined />}
          component={RouterLink}
          to={EntityPageSection.About}
          variant="contained"
        >
          {t('common.aboutThis', { entity: translatedJourneyTypeName })}
        </FullWidthButton>
        <ShareButton
          title={t('share-dialog.share-this', { entity: t(`common.${journeyTypeName}` as const) })}
          url={journeyLocation && buildJourneyUrl(journeyLocation)}
          entityTypeName={journeyTypeName}
        />
        {communityReadAccess && contactLeadsMessageReceivers.length > 0 && (
          <ContactLeadsButton onClick={openContactLeadsDialog}>
            {t('buttons.contact-leads', { contact: t(leadUsersHeader) })}
          </ContactLeadsButton>
        )}
        <DirectMessageDialog
          title={t('send-message-dialog.community-message-title', { contact: t(leadUsersHeader) })}
          open={isOpenContactLeadUsersDialog}
          onClose={closeContactLeadsDialog}
          onSendMessage={sendMessageToCommunityLeads}
          messageReceivers={contactLeadsMessageReceivers}
        />
        {timelineReadAccess && <DashboardCalendarSection journeyLocation={journeyLocation} />}
        {communityReadAccess && <DashboardUpdatesSection entities={{ spaceId: spaceNameId, communityId }} />}
        {communityReadAccess && (
          <EntityDashboardContributorsSection
            memberUsers={memberUsers}
            memberUsersCount={memberUsersCount}
            memberOrganizations={memberOrganizations}
            memberOrganizationsCount={memberOrganizationsCount}
          >
            <SeeMore subject={t('common.contributors')} to={`${EntityPageSection.Dashboard}/contributors`} />
          </EntityDashboardContributorsSection>
        )}
        <CalloutsGroupView
          callouts={callouts.groupedCallouts[CalloutDisplayLocation.HomeLeft]}
          spaceId={spaceNameId!}
          canCreateCallout={callouts.canCreateCallout}
          loading={callouts.loading}
          journeyTypeName={journeyTypeName}
          calloutNames={callouts.calloutNames}
          onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
          onCalloutUpdate={callouts.refetchCallout}
          displayLocation={CalloutDisplayLocation.HomeLeft}
        />
      </PageContentColumn>

      <PageContentColumn columns={8}>
        <DashboardRecentContributionsBlock
          halfWidth={(callouts.groupedCallouts[CalloutDisplayLocation.HomeRight]?.length ?? 0) > 0}
          readUsersAccess={readUsersAccess}
          entityReadAccess={entityReadAccess}
          activitiesLoading={activityLoading}
          topCallouts={topCallouts}
          activities={activities}
          journeyTypeName={journeyTypeName}
          journeyLocation={journeyLocation}
        />
        <CalloutsGroupView
          callouts={callouts.groupedCallouts[CalloutDisplayLocation.HomeRight]}
          spaceId={spaceNameId!}
          canCreateCallout={callouts.canCreateCallout}
          loading={callouts.loading}
          journeyTypeName={journeyTypeName}
          calloutNames={callouts.calloutNames}
          onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
          onCalloutUpdate={callouts.refetchCallout}
          displayLocation={CalloutDisplayLocation.HomeRight}
          blockProps={(callout, index) => {
            if (index === 0) {
              return {
                halfWidth: true,
              };
            }
          }}
        />
      </PageContentColumn>
    </PageContent>
  );
};

export default JourneyDashboardView;
