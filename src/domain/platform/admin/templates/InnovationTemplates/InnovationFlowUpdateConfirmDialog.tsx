import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { Button } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../core/ui/dialog/deprecated';

export interface SelectInnovationFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const InnovationFlowUpdateConfirmDialog: FC<SelectInnovationFlowDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} maxWidth="xs" aria-labelledby="confirm-innovation-flow">
      <DialogTitle id="confirm-innovation-flow">{t('components.select-innovation-flow.title')}</DialogTitle>
      <DialogContent dividers sx={{ paddingX: 2 }}>
        {t('components.confirm-innovation-flow.description.title')}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {onClose && <Button onClick={onClose}>{t('buttons.cancel')}</Button>}
        <Button onClick={onSubmit}>{t('buttons.confirm')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InnovationFlowUpdateConfirmDialog;
