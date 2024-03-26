import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';

export interface ApplicationSubmitedDialogProps {
  open: boolean;
  onClose: () => void;
}

const ApplicationSubmitedDialog: FC<ApplicationSubmitedDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose} />
      <DialogContent>
        <Gutters>{t('components.application-button.dialogApplicationSuccessful.apply.body')}</Gutters>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationSubmitedDialog;
