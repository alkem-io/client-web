import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { UseCalloutsSetProvided } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import SpaceWelcomeBlock from '@/domain/space/components/SpaceWelcomeBlock';
import DashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import { getSpaceWelcomeCache, removeSpaceWelcomeCache } from '@/domain/space/createSpace/utils';
import DashboardCalendarSection from '@/domain/shared/components/DashboardSections/DashboardCalendarSection';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
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
import { DashboardNavigationItem } from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import SpaceWelcomeDialog from '@/domain/space/components/SpaceWelcomeDialog';
import { InnovationFlowState } from '@/domain/collaboration/InnovationFlow/InnovationFlow';
import { SpaceAboutFullModel } from '@/domain/space/about/model/spaceAboutFull.model';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';

export type SpaceDashboardSpaceDetails = {
  id: string | undefined;
  level: SpaceLevel | undefined;
  about: SpaceAboutFullModel | undefined;
};

type SpaceDashboardViewProps = {
  space?: SpaceDashboardSpaceDetails;
  tabDescription?: string;
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
  canEdit?: boolean;
};

const SpaceDashboardView = ({
  space,
  tabDescription,
  dashboardNavigation,
  dashboardNavigationLoading,
  loading,
  calloutsSetProvided,
  shareUpdatesUrl,
  flowStateForNewCallouts,
  readUsersAccess,
  canEdit = false,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const [aboutDialogOpen, setAboutDialogOpen] = useState<boolean>(false);
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

    return () => {
      setAboutDialogOpen(false);
      onCloseTryVirtualContributor();
    };
  }, []);

  useEffect(() => {
    // on space change, check the cache and show welcome
    const cachedSpaceWelcome = getSpaceWelcomeCache();

    if (space?.id && cachedSpaceWelcome === space?.id) {
      setOpenWelcome(true);
    }
  }, [space?.id]);

  const membership = about?.membership;
  const leadUsers = membership?.leadUsers || [];
  const myMembershipStatus = membership?.myMembershipStatus;
  const communityId = membership?.communityID;
  const calloutsSetId = calloutsSetProvided.calloutsSetId;

  return (
    <>
      {directMessageDialog}
      <PageContent>
        {!loading && (
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
        )}
        <InfoColumn>
          <PageContentBlock accent>
            <SpaceWelcomeBlock
              description={tabDescription ?? ''}
              leadUsers={leadUsers}
              onContactLeadUser={receiver => sendMessage('user', receiver)}
              leadOrganizations={welcomeBlockContributors}
              onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
              onClickExpand={() => setAboutDialogOpen(true)}
              level={level}
              member={myMembershipStatus === CommunityMembershipStatus.Member}
            />
          </PageContentBlock>
          <FullWidthButton
            startIcon={<InfoOutlined />}
            onClick={() => setAboutDialogOpen(true)}
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
        {space && (
          <SpaceAboutDialog
            open={aboutDialogOpen}
            space={space}
            onClose={() => setAboutDialogOpen(false)}
            hasReadPrivilege
            hasEditPrivilege={canEdit}
          />
        )}
      </PageContent>
    </>
  );
};

export default SpaceDashboardView;
