import PageContent from '@/core/ui/content/PageContent';
import { Outlet } from 'react-router-dom';
import InfoColumn from '../components/InfoColumn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WelcomeBlock from '../components/WelcomeBlock';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import { CalendarMonth, KeyboardTab } from '@mui/icons-material';
import DialogActionButtons from '../components/subspaces/DialogActionButtons';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import { Box, Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import DashboardNavigation from '../components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import { useColumns } from '@/core/ui/grid/GridContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpaceDashboardNavigation from '../components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '../hooks/useSubSpace';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { DialogDef } from '../components/subspaces/DialogDefinition';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import SpaceWelcomeBlock from '../components/SpaceWelcomeBlock';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { DialogAction } from '../components/subspaces/DialogAction';
import CreateJourney from '../components/subspaces/SubspaceCreationDialog/CreateJourney';
const MENU_STATE_KEY = 'menuState';
enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

export const SubspaceInfoColumn = () => {
  const { t } = useTranslation();
  const { spaceId, spaceLevel, parentSpaceId } = useUrlResolver();
  const {
    permissions,
    subspace: {
      about: {
        profile: { url },
      },
    },
  } = useSubSpace();

  const dashboardNavigation = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });
  const { data: subspacePageData } = useSubspacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || spaceLevel === SpaceLevel.L0 || !permissions.canRead,
  });

  const subspace = subspacePageData?.lookup.space;
  const about = subspace?.about;
  const membership = about?.membership;
  const communityId = membership?.communityID;
  const collaboration = subspace?.collaboration;
  const collaborationId = collaboration?.id;

  const innovationFlowProvided = useInnovationFlowStates({ collaborationId });
  const [createSpaceState, setCreateSpaceState] = useState<
    | {
        isDialogVisible: true;
        parentSpaceId: string;
      }
    | {
        isDialogVisible: false;
        parentSpaceId?: never;
      }
  >({
    isDialogVisible: false,
  });
  const handleOpenCreateSubspace = ({ id }) => {
    setCreateSpaceState({
      isDialogVisible: true,
      parentSpaceId: id,
    });
  };

  const onCreateJourneyClose = () => {
    setCreateSpaceState({
      isDialogVisible: false,
    });
  };

  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false);
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const columns = 0; //useColumns();

  return (
    <InfoColumn collapsed={isCollapsed}>
      {!isCollapsed && (
        <WelcomeBlock about={!isMobile}>{about && <SpaceWelcomeBlock spaceAbout={about} />}</WelcomeBlock>
      )}
      {!isCollapsed && (
        <FullWidthButton
          startIcon={<KeyboardTab />}
          variant="contained"
          onClick={() => {
            setIsCollapsed(true);
            localStorage.setItem(MENU_STATE_KEY, MenuState.COLLAPSED);
          }}
          sx={{ '.MuiSvgIcon-root': { transform: 'rotate(180deg)' } }}
        >
          {t('buttons.collapse')}
        </FullWidthButton>
      )}
      <PageContentBlock
        accent={isCollapsed}
        row={!isCollapsed}
        sx={{
          padding: isCollapsed ? gutters(0.5) : 0,
          justifyContent: 'space-between',
          columnGap: 0.1,
          backgroundColor: isCollapsed ? undefined : 'transparent',
          border: isCollapsed ? undefined : 'transparent',
          overflow: isCollapsed ? undefined : 'visible',
        }}
      >
        {/* <DialogAction dialog={SubspaceDialog.About} /> */}
        {/* <DialogAction dialog={SubspaceDialog.Outline} /> */}
        <DialogAction dialog={SubspaceDialog.Index} />
        <DialogAction dialog={SubspaceDialog.Subspaces} />
        <DialogAction dialog={SubspaceDialog.Contributors} />
        <DialogAction dialog={SubspaceDialog.Activity} />
        <DialogAction dialog={SubspaceDialog.Timeline} dialogProps={{ temporaryLocation: true }} />
        <DialogAction dialog={SubspaceDialog.Share} dialogProps={{ entityTypeName: 'subspace', url }} />
        {innovationFlowProvided.canEditInnovationFlow && isMobile && (
          <DialogAction dialog={SubspaceDialog.ManageFlow} />
        )}
        {subspace?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) && (
          <DialogAction dialog={SubspaceDialog.Settings} />
        )}
        {isCollapsed && (
          <ButtonWithTooltip
            tooltip={t('buttons.expand')}
            tooltipPlacement="right"
            iconButton
            onClick={() => {
              setIsCollapsed(false);
              localStorage.setItem(MENU_STATE_KEY, MenuState.EXPANDED);
            }}
          >
            <KeyboardTab />
          </ButtonWithTooltip>
        )}
      </PageContentBlock>
      <DashboardNavigation
        compact={isCollapsed}
        currentItemId={spaceId}
        level={spaceLevel}
        dashboardNavigation={dashboardNavigation.dashboardNavigation}
        onCreateSubspace={handleOpenCreateSubspace}
      />
      {/*   onCurrentItemNotFound={dashboardNavigation.refetch} */}
      <DashboardUpdatesSection communityId={communityId} shareUrl={buildUpdatesUrl(about?.profile?.url ?? '')} />
      <CreateJourney
        isVisible={createSpaceState.isDialogVisible}
        onClose={onCreateJourneyClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
    </InfoColumn>
  );
};
