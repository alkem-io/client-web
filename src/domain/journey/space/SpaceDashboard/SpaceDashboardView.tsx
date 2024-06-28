import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutGroupName,
  CalloutsQueryVariables,
  CommunityMembershipStatus,
  DashboardLeadUserFragment,
  SpaceWelcomeBlockContributorProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import PageContent from '../../../../core/ui/content/PageContent';
import { JourneyTypeName } from '../../JourneyTypeName';
import DashboardCalendarSection from '../../../shared/components/DashboardSections/DashboardCalendarSection';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../community/application/applicationButton/ApplicationButton';
import { Theme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InfoOutlined } from '@mui/icons-material';
import { DashboardNavigationItem } from '../spaceDashboardNavigation/useSpaceDashboardNavigation';
import DashboardNavigation from '../../dashboardNavigation/DashboardNavigation';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import InfoColumn from '../../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../../core/ui/content/ContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { ContributorViewProps } from '../../../community/community/EntityDashboardContributorsSection/Types';

interface SpaceWelcomeBlockContributor {
  profile: SpaceWelcomeBlockContributorProfileFragment;
}

interface SpaceDashboardViewProps {
  spaceId: string | undefined;
  dashboardNavigation: DashboardNavigationItem | undefined;
  dashboardNavigationLoading: boolean;
  vision?: string;
  communityId?: string;
  organization?: unknown;
  host: ContributorViewProps | undefined;
  leadUsers: (SpaceWelcomeBlockContributor & DashboardLeadUserFragment)[] | undefined;
  leadVirtualContributors: ContributorViewProps[] | undefined;
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  childEntitiesCount?: number;
  journeyTypeName: JourneyTypeName;
  recommendations?: ReactNode;
  loading: boolean;
  shareUpdatesUrl: string;
  myMembershipStatus: CommunityMembershipStatus | undefined;
  callouts: {
    groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
    canCreateCallout: boolean;
    calloutNames: string[];
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
}

const SpaceDashboardView = ({
  spaceId,
  vision = '',
  dashboardNavigation,
  dashboardNavigationLoading,
  communityId = '',
  communityReadAccess = false,
  timelineReadAccess = false,
  host,
  leadUsers,
  leadVirtualContributors,
  journeyTypeName,
  callouts,
  shareUpdatesUrl,
  myMembershipStatus,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const welcomeBlockContributors = useMemo(() => host && [host], [host]);

  return (
    <>
      {directMessageDialog}
      <PageContent>
        <ApplicationButtonContainer journeyId={spaceId}>
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
                  journeyId={spaceId}
                  journeyLevel={0}
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>
        <InfoColumn>
          <PageContentBlock accent>
            <JourneyDashboardWelcomeBlock
              vision={vision}
              leadUsers={leadUsers}
              onContactLeadUser={receiver => sendMessage('user', receiver)}
              leadOrganizations={welcomeBlockContributors}
              leadVirtualContributors={leadVirtualContributors}
              onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
              journeyTypeName="space"
              member={myMembershipStatus === CommunityMembershipStatus.Member}
            />
          </PageContentBlock>
          <FullWidthButton
            startIcon={<InfoOutlined />}
            component={RouterLink}
            to={EntityPageSection.About}
            variant="contained"
          >
            {t('common.aboutThis', { entity: translatedJourneyTypeName })}
          </FullWidthButton>
          <DashboardNavigation
            currentItemId={spaceId}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {timelineReadAccess && <DashboardCalendarSection journeyId={spaceId} journeyTypeName={journeyTypeName} />}
          {communityReadAccess && <DashboardUpdatesSection communityId={communityId} shareUrl={shareUpdatesUrl} />}
        </InfoColumn>

        <ContentColumn>
          <CalloutsGroupView
            journeyId={spaceId}
            callouts={callouts.groupedCallouts[CalloutGroupName.Home]}
            canCreateCallout={callouts.canCreateCallout}
            loading={callouts.loading}
            journeyTypeName={journeyTypeName}
            calloutNames={callouts.calloutNames}
            onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
            onCalloutUpdate={callouts.refetchCallout}
            groupName={CalloutGroupName.Home}
          />
        </ContentColumn>
      </PageContent>
    </>
  );
};

export default SpaceDashboardView;
