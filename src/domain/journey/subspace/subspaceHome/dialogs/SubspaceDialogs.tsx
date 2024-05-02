import React, { useEffect } from 'react';
import CalloutsListDialog from '../../../../collaboration/callout/calloutsList/CalloutsListDialog';
import { useBackToStaticPath } from '../../../../../core/routing/useBackToPath';
import { useTranslation } from 'react-i18next';
import { UseCalloutsProvided } from '../../../../collaboration/callout/useCallouts/useCallouts';
import { SubspaceDialog } from '../../layout/SubspaceDialog';
import SubspacesListDialog from '../../dialogs/SubspacesListDialog';
import ContributorsToggleDialog from '../../dialogs/ContributorsToggleDialog';
import ActivityDialog from '../../../common/Activity/ActivityDialog';
import CalendarDialog from '../../../../timeline/calendar/CalendarDialog';
import { useParams } from 'react-router-dom';
import { ShareDialog } from '../../../../shared/components/ShareDialog/ShareDialog';
import InnovationFlowSettingsDialog from '../../../../collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { useCollaborationAuthorization } from '../../../../collaboration/authorization/useCollaborationAuthorization';
import DashboardNavigation from '../../../dashboardNavigation/DashboardNavigation';
import Dialog from '@mui/material/Dialog';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import { GRID_COLUMNS_MOBILE } from '../../../../../core/ui/grid/constants';
import { Theme, useMediaQuery } from '@mui/material';
import { DashboardNavigationItem } from '../../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';

export interface SubspaceDialogsProps {
  dialogOpen: SubspaceDialog | undefined;
  journeyId: string | undefined;
  journeyUrl: string | undefined;
  callouts: UseCalloutsProvided;
  dashboardNavigation: {
    dashboardNavigation: DashboardNavigationItem | undefined;
  };
}

const SubspaceDialogs = ({
  dialogOpen,
  journeyUrl,
  callouts,
  journeyId,
  dashboardNavigation,
}: SubspaceDialogsProps) => {
  const { t } = useTranslation();
  const { calendarEventNameId } = useParams();

  const handleClose = useBackToStaticPath(journeyUrl ?? '');

  const { collaborationId } = useCollaborationAuthorization({ journeyId });

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
        emptyListCaption={t('pages.generic.sections.subentities.empty', {
          entities: t('common.collaborationTools'),
        })}
      />
      <SubspacesListDialog journeyId={journeyId} open={dialogOpen === SubspaceDialog.Subspaces} onClose={handleClose} />
      <ContributorsToggleDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Contributors}
        onClose={handleClose}
      />
      <ActivityDialog journeyId={journeyId} open={dialogOpen === SubspaceDialog.Activity} onClose={handleClose} />
      <CalendarDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Timeline}
        onClose={handleClose}
        parentPath={journeyUrl}
        calendarEventNameId={calendarEventNameId}
      />
      <ShareDialog
        open={dialogOpen === SubspaceDialog.Share}
        onClose={handleClose}
        url={journeyUrl}
        entityTypeName={'subspace'}
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
