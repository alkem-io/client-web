import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import SubspacePageContainer from '../../subspace/containers/SubspacePageContainer';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import DashboardAllContributionsBlock from '../dashboardRecentContributionsBlock/DashboardAllContributionsBlock';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

const SubspacesListDialog = ({ open = false, journeyId, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { journeyTypeName } = useRouteResolver();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <DialogWithGrid open={open} fullScreen={isMobile} columns={8} aria-labelledby="activity-dialog">
      <DialogHeader onClose={onClose} title={t('common.contributions')} />
      <DialogContent>
        <SubspacePageContainer challengeId={journeyId}>
          {({ callouts, ...entities }) => (
            <DashboardAllContributionsBlock
              readUsersAccess={entities.permissions.readUsers}
              entityReadAccess={entities.permissions.subspaceReadAccess}
              activitiesLoading={false}
              topCallouts={entities.topCallouts}
              activities={entities.activities}
              journeyTypeName={journeyTypeName}
              fetchMoreActivities={entities.fetchMoreActivities}
            />
          )}
        </SubspacePageContainer>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default SubspacesListDialog;
