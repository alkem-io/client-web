import InfoColumn from '../components/InfoColumn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WelcomeBlock from '../components/WelcomeBlock';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import { KeyboardTab } from '@mui/icons-material';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import { gutters } from '@/core/ui/grid/utils';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import DashboardNavigation from '../components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpaceDashboardNavigation from '../components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '../hooks/useSubSpace';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import SpaceWelcomeBlock from '../components/SpaceWelcomeBlock';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { DialogActionButton } from '../components/subspaces/DialogActionButton';
import CreateJourney from '../components/subspaces/SubspaceCreationDialog/CreateJourney';
import { useScreenSize } from '@/core/ui/grid/constants';

export const MENU_STATE_KEY = 'menuState';
export enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

export const SubspaceInfoColumn = () => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();
  const { spaceId, spaceLevel } = useUrlResolver();
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

  return (
    <InfoColumn collapsed={isCollapsed}>
      {!isCollapsed && <WelcomeBlock>{about && <SpaceWelcomeBlock spaceAbout={about} />}</WelcomeBlock>}
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
        <DialogActionButton dialog={SubspaceDialog.Index} />
        <DialogActionButton dialog={SubspaceDialog.Subspaces} />
        <DialogActionButton dialog={SubspaceDialog.Contributors} />
        <DialogActionButton dialog={SubspaceDialog.Activity} />
        <DialogActionButton dialog={SubspaceDialog.Timeline} />
        <DialogActionButton dialog={SubspaceDialog.Share} />
        {innovationFlowProvided.canEditInnovationFlow && isSmallScreen && (
          <DialogActionButton dialog={SubspaceDialog.ManageFlow} />
        )}
        {subspace?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) && (
          <DialogActionButton dialog={SubspaceDialog.Settings} />
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
