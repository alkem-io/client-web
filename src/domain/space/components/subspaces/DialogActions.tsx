import { Dialog } from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { GRID_COLUMNS_MOBILE, useScreenSize } from '@/core/ui/grid/constants';
import GridProvider from '@/core/ui/grid/GridProvider';
import CalloutsListDialog from '@/domain/collaboration/callout/calloutsList/CalloutsListDialog';
import InnovationFlowSettingsDialog from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import { ShareDialog } from '@/domain/shared/components/ShareDialog/ShareDialog';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useVideoCall } from '../../hooks/useVideoCall';
import ActivityDialog from '../Activity/ActivityDialog';
import ContributorsToggleDialog from '../ContributorsToggleDialog';
import SubspacesListDialog from '../SubspacesListDialog';
import DashboardNavigation from '../spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import useSpaceDashboardNavigation from '../spaceDashboardNavigation/useSpaceDashboardNavigation';
import VideoCallDialog from '../VideoCallDialog/VideoCallDialog';
import { SubspaceDialog } from './SubspaceDialog';

export const DialogActions = () => {
  const { collaborationId } = useUrlResolver();

  const {
    subspace: {
      id: spaceId,
      nameId,
      about: {
        profile: { url },
        membership: { communityID: communityId },
      },
    },
  } = useSubSpace();
  const { isVideoCallEnabled } = useVideoCall(spaceId);

  const dashboardNavigation = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });

  const navigate = useNavigate();
  const handleClose = () => navigate(url);

  const { isSmallScreen } = useScreenSize();

  useEffect(() => {
    if (!isSmallScreen && currentDialog === SubspaceDialog.Outline) {
      handleClose();
    }
  }, [isSmallScreen]);

  const { dialog: currentDialog } = useParams();

  if (!currentDialog) {
    return null;
  }

  return (
    <>
      <CalloutsListDialog open={currentDialog === SubspaceDialog.Index} onClose={handleClose} />
      <SubspacesListDialog open={currentDialog === SubspaceDialog.Subspaces} onClose={handleClose} />
      <ContributorsToggleDialog open={currentDialog === SubspaceDialog.Contributors} onClose={handleClose} />
      {isVideoCallEnabled && (
        <VideoCallDialog
          open={currentDialog === SubspaceDialog.VideoCall}
          onClose={handleClose}
          spaceNameId={nameId}
          spaceId={spaceId}
        />
      )}
      <ActivityDialog open={currentDialog === SubspaceDialog.Activity} onClose={handleClose} />
      <CalendarDialog open={currentDialog === SubspaceDialog.Timeline} onClose={handleClose} temporaryLocation={true} />
      <ShareDialog
        open={currentDialog === SubspaceDialog.Share}
        onClose={handleClose}
        url={url}
        entityTypeName="subspace"
      />
      {communityId && (
        <CommunityUpdatesDialog
          communityId={communityId}
          open={currentDialog === SubspaceDialog.Updates}
          onClose={handleClose}
          loading={false}
        />
      )}
      <InnovationFlowSettingsDialog
        collaborationId={collaborationId}
        open={currentDialog === SubspaceDialog.ManageFlow}
        onClose={handleClose}
      />
      {dashboardNavigation && (
        <Dialog open={currentDialog === SubspaceDialog.Outline} onClose={handleClose} fullWidth={true}>
          <GridProvider columns={GRID_COLUMNS_MOBILE}>
            <DashboardNavigation currentItemId={spaceId} {...dashboardNavigation} />
          </GridProvider>
        </Dialog>
      )}
    </>
  );
};
