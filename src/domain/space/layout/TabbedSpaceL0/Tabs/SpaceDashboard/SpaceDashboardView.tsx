import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import RouterLink from '@/core/ui/link/RouterLink';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { UseCalloutsSetProvided } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import JourneyDashboardWelcomeBlock from '@/domain/journey/common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
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
import { DashboardNavigationItem } from '../../../../../journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import SpaceWelcomeDialog from '../../../../../journey/space/pages/SpaceWelcomeDialog';
import { InnovationFlowState } from '@/domain/collaboration/InnovationFlow/InnovationFlow';
import { SpaceAboutFullModel } from '@/domain/space/about/model/spaceAboutFull.model';

export type SpaceDashboardSpaceDetails = {
  id: string | undefined;
  level: SpaceLevel | undefined;
  about: SpaceAboutFullModel | undefined;
};

type SpaceDashboardViewProps = {
  space?: SpaceDashboardSpaceDetails;
  flowStateForNewCallouts: InnovationFlowState | undefined;
  dashboardNavigation: DashboardNavigationItem | undefined;
  dashboardNavigationLoading: boolean;
  organization?: unknown;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  childEntitiesCount?: number;
  recommendations?: ReactNode;
  loading: boolean;
  shareUpdatesUrl: string;
  calloutsSetProvided: UseCalloutsSetProvided;
};

const SpaceDashboardView = ({
  space,
  dashboardNavigation,
  dashboardNavigationLoading,
  calloutsSetProvided,
  shareUpdatesUrl,
  flowStateForNewCallouts,
  readUsersAccess,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const [tryVirtualContributorOpen, setTryVirtualContributorOpen] = useState(false);
  const [openWelcome, setOpenWelcome] = useState(false);
  const [vcId, setVcId] = useState<string>('');
  const level = space?.level ?? SpaceLevel.L0;
  const about = space?.about;

  const translatedSpaceLevel = t(`common.space-level.${level}`);

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const host = space?.about?.provider;

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

    if (space?.id && cachedSpaceWelcome === space?.id) {
      setOpenWelcome(true);
    }
  }, [space?.id]);

  const what = about?.profile.description || '';
  const membership = about?.membership;
  const leadUsers = membership?.leadUsers || [];
  const myMembershipStatus = membership?.myMembershipStatus;
  const communityId = membership?.communityID;
  const calloutsSetId = calloutsSetProvided.calloutsSetId;

  return (
    <>
      {directMessageDialog}
      <PageContent>
        <ApplicationButtonContainer journeyId={space?.id}>
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
                  journeyId={space?.id}
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
            sx={{ '&:hover': { color: theme => theme.palette.common.white } }}
          >
            {t('common.aboutThis', { entity: translatedSpaceLevel })}
          </FullWidthButton>
          <DashboardNavigation
            currentItemId={space?.id}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {readUsersAccess && <DashboardCalendarSection journeyId={space?.id} level={level} />}
          {readUsersAccess && <DashboardUpdatesSection communityId={communityId} shareUrl={shareUpdatesUrl} />}
        </InfoColumn>

        <ContentColumn>
          <CalloutsGroupView
            calloutsSetId={calloutsSetId}
            createInFlowState={flowStateForNewCallouts?.displayName}
            callouts={calloutsSetProvided.callouts}
            canCreateCallout={calloutsSetProvided.canCreateCallout}
            loading={calloutsSetProvided.loading}
            onSortOrderUpdate={calloutsSetProvided.onCalloutsSortOrderUpdate}
            onCalloutUpdate={calloutsSetProvided.refetchCallout}
          />
        </ContentColumn>
        {space?.id && tryVirtualContributorOpen && (
          <TryVirtualContributorDialog
            open={tryVirtualContributorOpen}
            onClose={onCloseTryVirtualContributor}
            spaceId={space.id}
            calloutsSetId={calloutsSetId}
            vcId={vcId}
          />
        )}
        {space?.id && openWelcome && <SpaceWelcomeDialog onClose={onCloseWelcome} />}
      </PageContent>
    </>
  );
};

export default SpaceDashboardView;
