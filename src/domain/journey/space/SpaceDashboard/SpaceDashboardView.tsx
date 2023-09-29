import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssociatedOrganizationDetailsFragment,
  CalloutDisplayLocation,
  CalloutsQueryVariables,
  DashboardLeadUserFragment,
  DashboardTopCalloutFragment,
  SpaceVisibility,
  SpaceWelcomeBlockContributorProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { JourneyLocation } from '../../../../main/routing/urlBuilders';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { JourneyTypeName } from '../../JourneyTypeName';
import DashboardCalendarSection from '../../../shared/components/DashboardSections/DashboardCalendarSection';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../community/application/applicationButton/ApplicationButton';
import { Theme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InfoOutlined } from '@mui/icons-material';
import { DashboardNavigationItem } from '../SpaceDashboardNavigation/useSpaceDashboardNavigation';
import DashboardNavigation from '../SpaceDashboardNavigation/DashboardNavigation';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import DashboardRecentContributionsBlock from '../../common/dashboardRecentContributionsBlock/DashboardRecentContributionsBlock';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import MembershipContainer from '../../../community/membership/membershipContainer/MembershipContainer';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { RECENT_ACTIVITIES_LIMIT_EXPANDED } from '../../common/journeyDashboard/constants';

interface SpaceWelcomeBlockContributor {
  profile: SpaceWelcomeBlockContributorProfileFragment;
}

interface SpaceDashboardViewProps extends Partial<CoreEntityIdTypes> {
  displayName: ReactNode;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  dashboardNavigationLoading: boolean;
  spaceVisibility?: SpaceVisibility;
  vision?: string;
  communityId?: string;
  organization?: unknown;
  leadOrganizations: (SpaceWelcomeBlockContributor & AssociatedOrganizationDetailsFragment)[] | undefined;
  leadUsers: (SpaceWelcomeBlockContributor & DashboardLeadUserFragment)[] | undefined;
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  activities: ActivityLogResultType[] | undefined;
  fetchMoreActivities: (limit: number) => void;
  activityLoading: boolean;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  childEntitiesCount?: number;
  journeyTypeName: JourneyTypeName;
  recommendations?: ReactNode;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  loading: boolean;
  callouts: {
    groupedCallouts: Record<CalloutDisplayLocation, TypedCallout[] | undefined>;
    canCreateCallout: boolean;
    calloutNames: string[];
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
}

const SpaceDashboardView = ({
  vision = '',
  displayName,
  dashboardNavigation,
  dashboardNavigationLoading,
  spaceVisibility,
  spaceNameId,
  challengeNameId,
  opportunityNameId,
  communityId = '',
  communityReadAccess = false,
  timelineReadAccess = false,
  entityReadAccess,
  readUsersAccess,
  leadOrganizations,
  leadUsers,
  activities,
  fetchMoreActivities,
  activityLoading,
  journeyTypeName,
  callouts,
  topCallouts,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const journeyLocation: JourneyLocation | undefined =
    typeof spaceNameId === 'undefined'
      ? undefined
      : {
          spaceNameId,
          challengeNameId,
          opportunityNameId,
        };

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <>
      {directMessageDialog}
      <PageContent>
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
                  journeyTypeName="space"
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>
        <PageContentColumn columns={4}>
          <JourneyDashboardWelcomeBlock
            vision={vision}
            leadUsers={leadUsers}
            onContactLeadUser={receiver => sendMessage('user', receiver)}
            leadOrganizations={leadOrganizations}
            onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
            journeyTypeName="space"
          >
            {props => <MembershipContainer {...props} />}
          </JourneyDashboardWelcomeBlock>
          <FullWidthButton
            startIcon={<InfoOutlined />}
            component={RouterLink}
            to={EntityPageSection.About}
            variant="contained"
          >
            {t('common.aboutThis', { entity: translatedJourneyTypeName })}
          </FullWidthButton>
          <DashboardNavigation
            spaceNameId={spaceNameId}
            spaceVisibility={spaceVisibility}
            displayName={displayName}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {timelineReadAccess && <DashboardCalendarSection journeyLocation={journeyLocation} />}
          {communityReadAccess && <DashboardUpdatesSection entities={{ spaceId: spaceNameId, communityId }} />}
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
            onActivitiesDialogOpen={() => fetchMoreActivities(RECENT_ACTIVITIES_LIMIT_EXPANDED)}
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
    </>
  );
};

export default SpaceDashboardView;
