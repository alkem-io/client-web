import { useEffect } from 'react';
import CalloutsListDialog from '@/domain/collaboration/callout/calloutsList/CalloutsListDialog';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { SubspaceDialog } from '@/domain/space/components/subspaces/SubspaceDialog';
import SubspacesListDialog from '@/domain/space/components/SubspacesListDialog';
import ContributorsToggleDialog from '@/domain/space/components/ContributorsToggleDialog';
import ActivityDialog from '@/domain/space/components/Activity/ActivityDialog';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import { ShareDialog } from '@/domain/shared/components/ShareDialog/ShareDialog';
import InnovationFlowSettingsDialog from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';
import DashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import Dialog from '@mui/material/Dialog';
import GridProvider from '@/core/ui/grid/GridProvider';
import { GRID_COLUMNS_MOBILE } from '@/core/ui/grid/constants';
import { Theme, useMediaQuery } from '@mui/material';
import { DashboardNavigationItem } from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { useParams } from 'react-router-dom';

export interface SubspaceDialogsProps {
  // dialogOpen: SubspaceDialog | undefined;
  spaceId: string | undefined;
  journeyUrl: string | undefined;
  parentSpaceId: string | undefined;
  calloutsSetId: string | undefined;
  dashboardNavigation: {
    dashboardNavigation: DashboardNavigationItem | undefined;
  };
  communityId: string | undefined;
  collaborationId: string | undefined;
  calendarEventId: string | undefined;
}

const SubspaceDialogs = ({
  // dialogOpen,
  journeyUrl,
  spaceId,
  calloutsSetId,
  parentSpaceId,
  dashboardNavigation,
  communityId,
  collaborationId,
  calendarEventId,
}: SubspaceDialogsProps) => {
  const { dialog: dialogOpen } = useParams();
  const handleClose = useBackToStaticPath(journeyUrl ?? '');

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!isMobile && dialogOpen === SubspaceDialog.Outline) {
      handleClose();
    }
  }, [isMobile]);

  if (!dialogOpen || !spaceId || !journeyUrl) {
    return null;
  }

  return (
    <>
      {/* done */}
      <CalloutsListDialog open={dialogOpen === SubspaceDialog.Index && Boolean(calloutsSetId)} onClose={handleClose} />
      {/* done */}
      <SubspacesListDialog open={dialogOpen === SubspaceDialog.Subspaces} onClose={handleClose} />
      {/* done */}
      <ContributorsToggleDialog open={dialogOpen === SubspaceDialog.Contributors} onClose={handleClose} />
      {/* done */}
      <ActivityDialog open={dialogOpen === SubspaceDialog.Activity} onClose={handleClose} />
      {/* done */}
      <CalendarDialog open={dialogOpen === SubspaceDialog.Timeline} onClose={handleClose} temporaryLocation />
      {/* done */}
      <ShareDialog
        open={dialogOpen === SubspaceDialog.Share}
        onClose={handleClose}
        url={journeyUrl}
        entityTypeName="subspace"
      />

      <CommunityUpdatesDialog
        open={dialogOpen === SubspaceDialog.Updates}
        onClose={handleClose}
        communityId={communityId}
        shareUrl={buildUpdatesUrl(journeyUrl ?? '')}
        loading={false}
      />
      {/* done */}
      <InnovationFlowSettingsDialog
        collaborationId={collaborationId}
        open={dialogOpen === SubspaceDialog.ManageFlow}
        onClose={handleClose}
      />
      {dashboardNavigation && (
        <Dialog open={dialogOpen === SubspaceDialog.Outline} onClose={handleClose} fullWidth>
          <GridProvider columns={GRID_COLUMNS_MOBILE}>
            <DashboardNavigation currentItemId={spaceId} {...dashboardNavigation} />
          </GridProvider>
        </Dialog>
      )}
    </>
  );
};

export default SubspaceDialogs;
