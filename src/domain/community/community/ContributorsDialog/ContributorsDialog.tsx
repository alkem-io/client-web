import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';

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
      <DialogHeader onClose={handleClose} title={t('dashboard-contributors-section.dialog-title')} />
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
