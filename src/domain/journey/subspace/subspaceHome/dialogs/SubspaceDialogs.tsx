import { useEffect } from 'react';
import CalloutsListDialog from '@/domain/collaboration/callout/calloutsList/CalloutsListDialog';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { useTranslation } from 'react-i18next';
import { UseCalloutsSetProvided } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { SubspaceDialog } from '@/domain/journey/subspace/layout/SubspaceDialog';
import SubspacesListDialog from '@/domain/journey/subspace/dialogs/SubspacesListDialog';
import ContributorsToggleDialog from '@/domain/journey/subspace/dialogs/ContributorsToggleDialog';
import ActivityDialog from '@/domain/journey/common/Activity/ActivityDialog';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import { ShareDialog } from '@/domain/shared/components/ShareDialog/ShareDialog';
import InnovationFlowSettingsDialog from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';
import DashboardNavigation from '@/domain/journey/dashboardNavigation/DashboardNavigation';
import Dialog from '@mui/material/Dialog';
import GridProvider from '@/core/ui/grid/GridProvider';
import { GRID_COLUMNS_MOBILE } from '@/core/ui/grid/constants';
import { Theme, useMediaQuery } from '@mui/material';
import { DashboardNavigationItem } from '@/domain/journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';

export interface SubspaceDialogsProps {
  dialogOpen: SubspaceDialog | undefined;
  journeyId: string | undefined;
  journeyUrl: string | undefined;
  parentSpaceId: string | undefined;
  callouts: UseCalloutsSetProvided;
  dashboardNavigation: {
    dashboardNavigation: DashboardNavigationItem | undefined;
  };
  communityId: string | undefined;
  collaborationId: string | undefined;
  calendarEventId: string | undefined;
}

const SubspaceDialogs = ({
  dialogOpen,
  journeyUrl,
  callouts,
  journeyId,
  parentSpaceId,
  dashboardNavigation,
  communityId,
  collaborationId,
  calendarEventId,
}: SubspaceDialogsProps) => {
  const { t } = useTranslation();

  const handleClose = useBackToStaticPath(journeyUrl ?? '');

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!isMobile && dialogOpen === SubspaceDialog.Outline) {
      handleClose();
    }
  }, [isMobile]);

  if (!dialogOpen || !journeyId || !journeyUrl) {
    return null;
  }

  return (
    <>
      <CalloutsListDialog
        open={dialogOpen === SubspaceDialog.Index}
        onClose={handleClose}
        callouts={callouts.callouts}
        loading={callouts.loading}
        emptyListCaption={t('pages.generic.sections.subEntities.empty', {
          entities: t('common.collaborationTools'),
        })}
      />
      <SubspacesListDialog journeyId={journeyId} open={dialogOpen === SubspaceDialog.Subspaces} onClose={handleClose} />
      <ContributorsToggleDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Contributors}
        onClose={handleClose}
      />
      <ActivityDialog spaceId={journeyId} open={dialogOpen === SubspaceDialog.Activity} onClose={handleClose} />
      <CalendarDialog
        journeyId={journeyId}
        parentSpaceId={parentSpaceId}
        open={dialogOpen === SubspaceDialog.Timeline}
        onClose={handleClose}
        parentPath={journeyUrl}
        calendarEventId={calendarEventId}
        temporaryLocation
      />
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
      <InnovationFlowSettingsDialog
        collaborationId={collaborationId}
        open={dialogOpen === SubspaceDialog.ManageFlow}
        onClose={handleClose}
      />
      {dashboardNavigation && (
        <Dialog open={dialogOpen === SubspaceDialog.Outline} onClose={handleClose} fullWidth>
          <GridProvider columns={GRID_COLUMNS_MOBILE}>
            <DashboardNavigation currentItemId={journeyId} {...dashboardNavigation} />
          </GridProvider>
        </Dialog>
      )}
    </>
  );
};

export default SubspaceDialogs;
