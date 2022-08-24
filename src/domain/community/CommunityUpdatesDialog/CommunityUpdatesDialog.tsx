import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import { DialogContent, DialogTitle } from '../../../components/core/dialog';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdatesContainer';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';

export interface CommunityUpdatesDialogProps {
  open: boolean;
  onClose: () => void;
  hubId?: string;
  communityId?: string;
}

const CommunityUpdatesDialog: FC<CommunityUpdatesDialogProps> = ({ open, onClose, hubId, communityId = '' }) => {
  const { t } = useTranslation();
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogTitle id="community-updates-dialog-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          {t('dashboard-updates-section.dialog-title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box marginBottom={2} marginTop={4}>
          <CommunityUpdatesContainer entities={{ hubId, communityId }}>
            {({ messages, authors }, actions, loading) => (
              <CommunityUpdatesView
                entities={{ messages, authors }}
                actions={{
                  onSubmit: message => actions.onSubmit(message, communityId),
                  onRemove: messageId => actions.onRemove(messageId, communityId),
                }}
                state={{
                  loadingMessages: loading.retrievingUpdateMessages,
                  submittingMessage: false,
                  removingMessage: false,
                }}
                options={{
                  hideHeaders: true,
                  disableCollapse: true,
                  disableElevation: true,
                  itemsPerRow: 1,
                }}
              />
            )}
          </CommunityUpdatesContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommunityUpdatesDialog;
