import PageContent from '@/core/ui/content/PageContent';
import { Outlet } from 'react-router-dom';
import InfoColumn from '../components/InfoColumn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WelcomeBlock from '../components/WelcomeBlock';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import { KeyboardTab } from '@mui/icons-material';
import DialogActionButtons from '../components/subspaces/DialogActionButtons';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import { Box, Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import DashboardNavigation from '../components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import { useColumns } from '@/core/ui/grid/GridContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpaceDashboardNavigation from '../components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '../hooks/useSubSpace';
import { buildUpdatesUrlLegacy } from '@/main/routing/urlBuilders';
import { DialogDef } from '../components/subspaces/DialogDefinition';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import {
  AccountTreeOutlined,
  CalendarMonthOutlined,
  GroupsOutlined,
  HistoryOutlined,
  InfoOutlined,
  ListOutlined,
  SegmentOutlined,
  SettingsOutlined,
  ShareOutlined,
} from '@mui/icons-material';

import { InnovationFlowIcon } from '@/domain/collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import SpaceWelcomeBlock from '../components/SpaceWelcomeBlock';

const MENU_STATE_KEY = 'menuState';
enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

export const SubspacePageLayout = () => {
  const { spaceId, spaceLevel, journeyPath, parentSpaceId, levelZeroSpaceId, calendarEventId, loading } =
    useUrlResolver();

  const { permissions } = useSubSpace();
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
  const roleSetID = membership?.roleSetID;
  const communityId = membership?.communityID;
  const collaboration = subspace?.collaboration;
  const calloutsSetId = collaboration?.calloutsSet.id;
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

  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false);
  const { t } = useTranslation();

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const columns = 0; //useColumns();
  return (
    <PageContent>
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
        <DialogActionButtons column={isCollapsed}>
          <DialogDef
            dialogType={SubspaceDialog.About}
            label={t(`spaceDialog.${SubspaceDialog.About}` as const)}
            icon={InfoOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Outline}
            label={t(`spaceDialog.${SubspaceDialog.Outline}` as const)}
            icon={AccountTreeOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Index}
            label={t(`spaceDialog.${SubspaceDialog.Index}` as const)}
            icon={ListOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Subspaces}
            label={t(`spaceDialog.${SubspaceDialog.Subspaces}` as const)}
            icon={SegmentOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Contributors}
            label={t(`spaceDialog.${SubspaceDialog.Contributors}` as const)}
            icon={GroupsOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Activity}
            label={t(`spaceDialog.${SubspaceDialog.Activity}` as const)}
            icon={HistoryOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Timeline}
            label={t('spaceDialog.events')}
            icon={CalendarMonthOutlined}
          />
          <DialogDef
            dialogType={SubspaceDialog.Share}
            label={t(`spaceDialog.${SubspaceDialog.Share}` as const)}
            icon={ShareOutlined}
          />
          {innovationFlowProvided.canEditInnovationFlow && (
            <DialogDef
              dialogType={SubspaceDialog.ManageFlow}
              label={t(`spaceDialog.${SubspaceDialog.ManageFlow}` as const)}
              icon={InnovationFlowIcon}
            />
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
        </DialogActionButtons>
        {/* <Outline */}
        <DashboardNavigation
          compact={columns === 0}
          currentItemId={spaceId}
          level={spaceLevel}
          dashboardNavigation={dashboardNavigation.dashboardNavigation}
          onCreateSubspace={handleOpenCreateSubspace}
        />
        {/*   onCurrentItemNotFound={dashboardNavigation.refetch} */}
        <DashboardUpdatesSection
          communityId={communityId}
          shareUrl={buildUpdatesUrlLegacy(about?.profile?.url ?? '')}
        />
      </InfoColumn>
      <PageContentColumnBase columns={isCollapsed ? 12 : 9} flexBasis={0} flexGrow={1} flexShrink={1} minWidth={0}>
        <ApplicationButtonContainer journeyId={spaceId} parentSpaceId={parentSpaceId}>
          {(applicationButtonProps, loading) => {
            if (loading || applicationButtonProps.isMember) {
              return null;
            }
            return (
              <PageContentColumn columns={9}>
                <ApplicationButton
                  {...applicationButtonProps}
                  loading={loading}
                  component={FullWidthButton}
                  extended={hasExtendedApplicationButton}
                  journeyId={'journeyId'}
                  spaceLevel={SpaceLevel.L1}
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>

        <Outlet />
      </PageContentColumnBase>
    </PageContent>
  );
};
