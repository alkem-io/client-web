import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import SubspacePageContainer from '../../subspace/containers/SubspacePageContainer';
import RecentContributionsBlock from './RecentContributionsBlock';

export interface ActivityDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

const ActivityDialog = ({ open = false, journeyId, onClose }: ActivityDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={8} aria-labelledby="activity-dialog">
      <DialogHeader onClose={onClose} title={t('common.contributions')} />
      <DialogContent sx={{ paddingTop: 0 }}>
        <SubspacePageContainer challengeId={journeyId}>
          {({ callouts, ...entities }) => (
            <RecentContributionsBlock
              readUsersAccess={entities.permissions.readUsers}
              entityReadAccess={entities.permissions.subspaceReadAccess}
              activitiesLoading={false}
              topCallouts={entities.topCallouts}
              activities={entities.activities}
              fetchMoreActivities={entities.fetchMoreActivities}
            />
          )}
        </SubspacePageContainer>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ActivityDialog;
