import React from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import SubspacePageContainer from '../containers/SubspacePageContainer';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import DashboardAllContributionsBlock from '../../common/dashboardRecentContributionsBlock/DashboardAllContributionsBlock';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

const SubspacesListDialog = ({ open = false, journeyId, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { journeyTypeName } = useRouteResolver();

  return (
    <DialogWithGrid open={open} columns={8}>
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
