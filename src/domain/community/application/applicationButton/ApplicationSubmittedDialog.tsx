import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { BlockTitle } from '@/core/ui/typography';

export interface ApplicationSubmitedDialogProps {
  open: boolean;
  onClose: () => void;
}

const ApplicationSubmitedDialog: FC<ApplicationSubmitedDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} maxWidth={'sm'} fullWidth>
      <DialogHeader onClose={onClose} />
      <DialogContent sx={{ paddingBottom: 6 }}>
        <Gutters alignItems="center">
          <BlockTitle>{t('components.application-button.dialogApplicationSuccessful.apply.body')}</BlockTitle>
        </Gutters>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationSubmitedDialog;
