import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { DialogTitle } from '@/core/ui/dialog/deprecated';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

export interface ContributorsDialogContentProps {
  dialogOpen: boolean;
}

export interface ContributorsDialogProps {
  open: boolean;
  onClose: () => void;
  dialogContent: ComponentType<ContributorsDialogContentProps>;
}

const ContributorsDialog = ({ open, onClose, dialogContent: Content }: ContributorsDialogProps) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  return (
    <DialogWithGrid open={open} columns={4} fullWidth aria-labelledby="community-updates-dialog-title">
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
    </DialogWithGrid>
  );
};

export default ContributorsDialog;
