import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutGroupName,
  CalloutsQueryVariables,
  CommunityMembershipStatus,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import PageContent from '@/core/ui/content/PageContent';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import DashboardCalendarSection from '@/domain/shared/components/DashboardSections/DashboardCalendarSection';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import { Theme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InfoOutlined } from '@mui/icons-material';
import { DashboardNavigationItem } from '../spaceDashboardNavigation/useSpaceDashboardNavigation';
import DashboardNavigation from '@/domain/journey/dashboardNavigation/DashboardNavigation';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import JourneyDashboardWelcomeBlock, {
  JourneyDashboardWelcomeBlockProps,
} from '@/domain/journey/common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import RouterLink from '@/core/ui/link/RouterLink';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import {
  getVCCreationCache,
  removeVCCreationCache,
} from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/utils';
import TryVirtualContributorDialog from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/TryVirtualContributorDialog';
import { getSpaceWelcomeCache, removeSpaceWelcomeCache } from '@/domain/journey/space/createSpace/utils';
import SpaceWelcomeDialog from './SpaceWelcomeDialog';

type SpaceDashboardViewProps = {
  spaceId: string | undefined;
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  dashboardNavigation: DashboardNavigationItem | undefined;
  dashboardNavigationLoading: boolean;
  vision?: string;
  communityId?: string;
  organization?: unknown;
  host: ContributorViewProps | undefined;
  leadUsers: JourneyDashboardWelcomeBlockProps['leadUsers'];
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
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
};

const SpaceDashboardView = ({
  spaceId,
  collaborationId,
  calloutsSetId,
  vision = '',
  dashboardNavigation,
  dashboardNavigationLoading,
  communityId = '',
  communityReadAccess = false,
  timelineReadAccess = false,
  host,
  leadUsers,
  journeyTypeName,
  callouts,
  shareUpdatesUrl,
  myMembershipStatus,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const [tryVirtualContributorOpen, setTryVirtualContributorOpen] = useState(false);
  const [openWelcome, setOpenWelcome] = useState(false);
  const [vcId, setVcId] = useState<string>('');

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const welcomeBlockContributors = useMemo(() => host && [host], [host]);

  const onCloseTryVirtualContributor = () => {
    setTryVirtualContributorOpen(false);
    removeVCCreationCache();
  };

  const onCloseWelcome = () => {
    setOpenWelcome(false);
    removeSpaceWelcomeCache();
  };

  useEffect(() => {
    // on mount of a space, check the LS and show the try dialog if present
    const cachedVC = getVCCreationCache();

    if (cachedVC) {
      setVcId(cachedVC);
      setTryVirtualContributorOpen(true);
    }

    return onCloseTryVirtualContributor;
  }, []);

  useEffect(() => {
    // on space change, check the cache and show welcome
    const cachedSpaceWelcome = getSpaceWelcomeCache();

    if (spaceId && cachedSpaceWelcome === spaceId) {
      setOpenWelcome(true);
    }
  }, [spaceId]);

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
                  spaceLevel={SpaceLevel.L0}
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
            calloutsSetId={calloutsSetId}
            callouts={callouts.groupedCallouts[CalloutGroupName.Home]}
            canCreateCallout={callouts.canCreateCallout}
            loading={callouts.loading}
            journeyTypeName={journeyTypeName}
            onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
            onCalloutUpdate={callouts.refetchCallout}
            groupName={CalloutGroupName.Home}
          />
        </ContentColumn>
        {spaceId && tryVirtualContributorOpen && (
          <TryVirtualContributorDialog
            open={tryVirtualContributorOpen}
            onClose={onCloseTryVirtualContributor}
            spaceId={spaceId}
            collaborationId={collaborationId}
            calloutsSetId={calloutsSetId}
            vcId={vcId}
          />
        )}
        {spaceId && openWelcome && <SpaceWelcomeDialog onClose={onCloseWelcome} />}
      </PageContent>
    </>
  );
};

export default SpaceDashboardView;
