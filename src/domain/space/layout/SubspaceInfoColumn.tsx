import InfoColumn from '../components/InfoColumn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WelcomeBlock from '../components/WelcomeBlock';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import { KeyboardTab } from '@mui/icons-material';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import { gutters } from '@/core/ui/grid/utils';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import DashboardNavigation from '../components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpaceDashboardNavigation from '../components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import SpaceWelcomeBlock from '../components/SpaceWelcomeBlock';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { DialogActionButton } from '../components/subspaces/DialogActionButton';
import { SubmenuActionButton } from '../components/subspaces/SubmenuActionButton';
import { useScreenSize } from '@/core/ui/grid/constants';
import CreateSubspace from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import { useVideoCall } from '../hooks/useVideoCall';

interface SubspaceInfoColumnProps {
  subspace?: {
    id?: string;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[] | null;
    };
    about?: {
      membership: {
        roleSetID: string;
        communityID: string;
        myMembershipStatus?: CommunityMembershipStatus | string;
      };
      profile: { url: string; description?: string };
    };
    collaboration?: {
      id: string;
    };
  };
}

export const MENU_STATE_KEY = 'menuState';
export enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

export const SubspaceInfoColumn = ({ subspace }: SubspaceInfoColumnProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();
  const { spaceId, spaceLevel } = useUrlResolver();

  const dashboardNavigation = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });

  const about = subspace?.about;
  const membership = about?.membership;
  const communityId = membership?.communityID;
  const collaborationId = subspace?.collaboration?.id;

  const { isVideoCallEnabled } = useVideoCall(subspace?.id);

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

  const onCreateSubspaceClose = () => {
    setCreateSpaceState({
      isDialogVisible: false,
    });
  };

  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false);

  const canEdit = subspace?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

  return (
    <InfoColumn collapsed={isCollapsed}>
      {!isCollapsed && (
        <WelcomeBlock>{about && <SpaceWelcomeBlock spaceAbout={about} canEdit={canEdit} />}</WelcomeBlock>
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
          justifyContent: 'flex-start',
          columnGap: 0.2,
          backgroundColor: isCollapsed ? undefined : 'transparent',
          border: isCollapsed ? undefined : 'transparent',
          overflow: 'visible',
          flexWrap: 'nowrap',
          width: '100%',
          ...(!isCollapsed && {
            '& > *': {
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: '100%',
            },
          }),
        }}
      >
        {!isCollapsed && (
          <>
            {isVideoCallEnabled && <DialogActionButton dialog={SubspaceDialog.VideoCall} />}
            <DialogActionButton dialog={SubspaceDialog.Contributors} />
            <DialogActionButton dialog={SubspaceDialog.Activity} />
            <DialogActionButton dialog={SubspaceDialog.Timeline} />
            {innovationFlowProvided.canEditInnovationFlow && isSmallScreen && (
              <DialogActionButton dialog={SubspaceDialog.ManageFlow} />
            )}
            {canEdit && <DialogActionButton dialog={SubspaceDialog.Settings} />}
            <SubmenuActionButton dialogs={[SubspaceDialog.Index, SubspaceDialog.Subspaces, SubspaceDialog.Share]} />
          </>
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
      {!isCollapsed && (
        <DashboardUpdatesSection communityId={communityId} shareUrl={buildUpdatesUrl(about?.profile?.url ?? '')} />
      )}
      <CreateSubspace
        open={createSpaceState.isDialogVisible}
        onClose={onCreateSubspaceClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
    </InfoColumn>
  );
};
