import { useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Theme, useMediaQuery } from '@mui/material';

import { SubspaceDialog } from '../../layout/SubspaceDialog';
import SubspacesListDialog from '../../dialogs/SubspacesListDialog';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import ActivityDialog from '../../../common/Activity/ActivityDialog';
import CalendarDialog from '../../../../timeline/calendar/CalendarDialog';
import ContributorsToggleDialog from '../../dialogs/ContributorsToggleDialog';
import DashboardNavigation from '../../../dashboardNavigation/DashboardNavigation';
import { ShareDialog } from '../../../../shared/components/ShareDialog/ShareDialog';
import CalloutsListDialog from '../../../../collaboration/callout/calloutsList/CalloutsListDialog';
import CommunityUpdatesDialog from '../../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import InnovationFlowSettingsDialog from '../../../../collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';

import { buildUpdatesUrl } from '../../../../../main/routing/urlBuilders';
import { GRID_COLUMNS_MOBILE } from '../../../../../core/ui/grid/constants';
import { useBackToStaticPath } from '../../../../../core/routing/useBackToPath';
import { type UseCalloutsProvided } from '../../../../collaboration/callout/useCallouts/useCallouts';
import { type DashboardNavigationItem } from '../../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useCollaborationAuthorization } from '../../../../collaboration/authorization/useCollaborationAuthorization';

const SubspaceDialogs = ({
  callouts,
  journeyId,
  dialogOpen,
  journeyUrl,
  communityId,
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
        loading={callouts.loading}
        callouts={callouts.callouts}
        open={dialogOpen === SubspaceDialog.Index}
        emptyListCaption={t('pages.generic.sections.subentities.empty', {
          entities: t('common.collaborationTools'),
        })}
        onClose={handleClose}
      />

      <SubspacesListDialog journeyId={journeyId} open={dialogOpen === SubspaceDialog.Subspaces} onClose={handleClose} />

      <ContributorsToggleDialog
        journeyId={journeyId}
        open={dialogOpen === SubspaceDialog.Contributors}
        onClose={handleClose}
      />

      <ActivityDialog journeyId={journeyId} open={dialogOpen === SubspaceDialog.Activity} onClose={handleClose} />

      <CalendarDialog
        temporaryLocation
        journeyId={journeyId}
        parentPath={journeyUrl}
        calendarEventNameId={calendarEventNameId}
        open={dialogOpen === SubspaceDialog.Timeline}
        onClose={handleClose}
      />

      <ShareDialog
        url={journeyUrl}
        entityTypeName="subspace"
        open={dialogOpen === SubspaceDialog.Share}
        onClose={handleClose}
      />

      <CommunityUpdatesDialog
        loading={false}
        communityId={communityId}
        open={dialogOpen === SubspaceDialog.Updates}
        shareUrl={journeyUrl ? buildUpdatesUrl(journeyUrl) : ''}
        onClose={handleClose}
      />

      <InnovationFlowSettingsDialog
        collaborationId={collaborationId}
        open={dialogOpen === SubspaceDialog.ManageFlow}
        onClose={handleClose}
      />

      {dashboardNavigation && (
        <Dialog fullWidth open={dialogOpen === SubspaceDialog.Outline} onClose={handleClose}>
          <GridProvider columns={GRID_COLUMNS_MOBILE}>
            <DashboardNavigation currentItemId={journeyId} {...dashboardNavigation} />
          </GridProvider>
        </Dialog>
      )}
    </>
  );
};

export default SubspaceDialogs;

export interface SubspaceDialogsProps {
  journeyId: string | undefined;
  callouts: UseCalloutsProvided;
  journeyUrl: string | undefined;
  communityId: string | undefined;
  dialogOpen: SubspaceDialog | undefined;
  dashboardNavigation: {
    dashboardNavigation: DashboardNavigationItem | undefined;
  };
}
