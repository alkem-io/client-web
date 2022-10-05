import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { Box, Button } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';

export interface SelectInnovationFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const InnovationFlowUpdateConfirmDialog: FC<SelectInnovationFlowDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} maxWidth="xs" fullWidth aria-labelledby="change-innovation-flow">
      <DialogTitle id="change-innovation-flow">{t('components.select-innovation-flow.title')}</DialogTitle>
      <DialogContent dividers>
        <Box paddingY={theme => theme.spacing(2)}>{'Are you sure?'}</Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {onClose && <Button onClick={onClose}>{t('buttons.cancel')}</Button>}
        <Button onClick={onSubmit}>{t('buttons.confirm')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InnovationFlowUpdateConfirmDialog;
