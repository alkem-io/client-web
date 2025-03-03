import {
  CalloutsOnCalloutsSetQueryVariables,
  CommunityMembershipStatus,
  SpaceLevel,
  TagsetReservedName,
} from '@/core/apollo/generated/graphql-schema';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import RouterLink from '@/core/ui/link/RouterLink';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import JourneyDashboardWelcomeBlock, {
  JourneyDashboardWelcomeBlockProps,
} from '@/domain/journey/common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import DashboardNavigation from '@/domain/journey/dashboardNavigation/DashboardNavigation';
import { getSpaceWelcomeCache, removeSpaceWelcomeCache } from '@/domain/journey/space/createSpace/utils';
import DashboardCalendarSection from '@/domain/shared/components/DashboardSections/DashboardCalendarSection';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import TryVirtualContributorDialog from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/TryVirtualContributorDialog';
import {
  getVCCreationCache,
  removeVCCreationCache,
} from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/utils';
import { InfoOutlined } from '@mui/icons-material';
import { Theme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardNavigationItem } from '../spaceDashboardNavigation/useSpaceDashboardNavigation';
import SpaceWelcomeDialog from './SpaceWelcomeDialog';
import { ClassificationFilterModel } from '@/domain/collaboration/calloutsSet/ClassificationFilter.model';

type SpaceDashboardViewProps = {
  spaceId: string | undefined;
  level: SpaceLevel | undefined;
  innovationFlowStates: string[];
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  dashboardNavigation: DashboardNavigationItem | undefined;
  dashboardNavigationLoading: boolean;
  what?: string;
  communityId?: string;
  organization?: unknown;
  host: ContributorViewProps | undefined;
  leadUsers: JourneyDashboardWelcomeBlockProps['leadUsers'];
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  childEntitiesCount?: number;
  recommendations?: ReactNode;
  loading: boolean;
  shareUpdatesUrl: string;
  myMembershipStatus: CommunityMembershipStatus | undefined;
  callouts: {
    groupedCallouts: Record<string, TypedCallout[] | undefined>;
    canCreateCallout: boolean;
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsOnCalloutsSetQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
};

const SpaceDashboardView = ({
  spaceId,
  level,
  collaborationId,
  innovationFlowStates: calloutFlowStates,
  calloutsSetId,
  what = '',
  dashboardNavigation,
  dashboardNavigationLoading,
  communityId = '',
  communityReadAccess = false,
  timelineReadAccess = false,
  host,
  leadUsers,
  callouts,
  shareUpdatesUrl,
  myMembershipStatus,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const [tryVirtualContributorOpen, setTryVirtualContributorOpen] = useState(false);
  const [openWelcome, setOpenWelcome] = useState(false);
  const [vcId, setVcId] = useState<string>('');

  const translatedSpaceLevel = t(`common.space-level.${level ?? SpaceLevel.L0}`);

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

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
    const cachedVCId = getVCCreationCache();

    if (cachedVCId) {
      setVcId(cachedVCId);
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

  const classificationFilter: ClassificationFilterModel = {
    name: TagsetReservedName.FlowState,
    tags: [calloutFlowStates[0]],
  };

  return (
    <>
      {directMessageDialog}
      <PageContent>
        <ApplicationButtonContainer journeyId={spaceId}>
          {(applicationButtonProps, loading) => {
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
                  spaceLevel={level}
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>
        <InfoColumn>
          <PageContentBlock accent>
            <JourneyDashboardWelcomeBlock
              description={what}
              leadUsers={leadUsers}
              onContactLeadUser={receiver => sendMessage('user', receiver)}
              leadOrganizations={welcomeBlockContributors}
              onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
              level={level}
              member={myMembershipStatus === CommunityMembershipStatus.Member}
            />
          </PageContentBlock>
          <FullWidthButton
            startIcon={<InfoOutlined />}
            component={RouterLink}
            to={EntityPageSection.About}
            variant="contained"
          >
            {t('common.aboutThis', { entity: translatedSpaceLevel })}
          </FullWidthButton>
          <DashboardNavigation
            currentItemId={spaceId}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {timelineReadAccess && <DashboardCalendarSection journeyId={spaceId} level={level} />}
          {communityReadAccess && <DashboardUpdatesSection communityId={communityId} shareUrl={shareUpdatesUrl} />}
        </InfoColumn>

        <ContentColumn>
          <CalloutsGroupView
            calloutsSetId={calloutsSetId}
            callouts={callouts.groupedCallouts[calloutFlowStates[0]]}
            canCreateCallout={callouts.canCreateCallout}
            loading={callouts.loading}
            onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
            onCalloutUpdate={callouts.refetchCallout}
            classificationFilter={classificationFilter}
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
