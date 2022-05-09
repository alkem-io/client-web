import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import { DialogContent, DialogTitle } from '../../../common/components/core/dialog';

export interface ContributorsDialogContentProps {
  dialogOpen: boolean;
}

export interface ContributorsDialogProps {
  open: boolean;
  onClose: () => void;
  dialogContent: ComponentType<ContributorsDialogContentProps>;
}

const ContributorsDialog: FC<ContributorsDialogProps> = ({ open, onClose, dialogContent: Content }) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogTitle id="community-updates-dialog-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          {t('dashboard-contributors-section.dialog-title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box marginBottom={2}>
          <Content dialogOpen={open} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContributorsDialog;
