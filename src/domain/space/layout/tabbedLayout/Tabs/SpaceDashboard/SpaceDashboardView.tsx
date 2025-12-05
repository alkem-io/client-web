import { useEffect, useState } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { UseCalloutsSetProvided } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import SpaceWelcomeBlock from '@/domain/space/components/SpaceWelcomeBlock';
import DashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import { getSpaceWelcomeCache, removeSpaceWelcomeCache } from '@/domain/space/components/CreateSpace/utils';
import DashboardCalendarSection from '@/domain/shared/components/DashboardSections/DashboardCalendarSection';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import TryVirtualContributorDialog from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/TryVirtualContributorDialog';
import {
  getVCCreationCache,
  removeVCCreationCache,
} from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/utils';
import { InfoOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DashboardNavigationItem } from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import SpaceWelcomeDialog from '@/domain/space/components/SpaceWelcomeDialog';
import { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';
import { SpaceAboutFullModel } from '@/domain/space/about/model/spaceAboutFull.model';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';

export type SpaceDashboardSpaceDetails = {
  id: string | undefined;
  level: SpaceLevel | undefined;
  about: SpaceAboutFullModel | undefined;
};

type SpaceDashboardViewProps = {
  space?: SpaceDashboardSpaceDetails;
  dashboardNavigation: DashboardNavigationItem | undefined;
  dashboardNavigationLoading: boolean;
  calloutsSetProvided: UseCalloutsSetProvided;
  shareUpdatesUrl: string;
  flowStateForNewCallouts: InnovationFlowStateModel | undefined;
  tabDescription?: string;
  canEdit?: boolean;
  readUsersAccess: boolean;
};

const SpaceDashboardView = ({
  space,
  dashboardNavigation,
  dashboardNavigationLoading,
  calloutsSetProvided,
  shareUpdatesUrl,
  flowStateForNewCallouts,
  readUsersAccess,
  tabDescription,
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

  const { directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

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
  const communityId = membership?.communityID;
  const calloutsSetId = calloutsSetProvided.calloutsSetId;

  if (!space?.id) {
    return null;
  }

  return (
    <>
      {directMessageDialog}
      <PageContent>
        <InfoColumn>
          <PageContentBlock accent>
            <SpaceWelcomeBlock spaceAbout={space?.about!} description={tabDescription} canEdit={canEdit} tabIndex={0} />
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
          {readUsersAccess && <DashboardCalendarSection spaceId={space?.id} level={level} />}
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
        {tryVirtualContributorOpen && (
          <TryVirtualContributorDialog
            open={tryVirtualContributorOpen}
            onClose={onCloseTryVirtualContributor}
            spaceId={space.id}
            calloutsSetId={calloutsSetId}
            vcId={vcId}
          />
        )}
        {openWelcome && <SpaceWelcomeDialog onClose={onCloseWelcome} />}
        <SpaceAboutDialog
          open={aboutDialogOpen}
          space={space}
          onClose={() => setAboutDialogOpen(false)}
          hasReadPrivilege
          hasEditPrivilege={canEdit}
        />
      </PageContent>
    </>
  );
};

export default SpaceDashboardView;
