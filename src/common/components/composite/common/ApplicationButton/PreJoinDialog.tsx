import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { DialogActions, DialogTitle } from '../../../core/dialog';

export interface PreApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => void;
}

const PreJoinDialog: FC<PreApplicationDialogProps> = ({ open, onClose, onJoin }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogTitle onClose={onClose}>{t('components.application-button.dialog-join.title')}</DialogTitle>
      <DialogContent dividers>
        <>
          <Typography
            variant="body1"
            dangerouslySetInnerHTML={{
              __html: t('components.application-button.dialog-join.body'),
            }}
          />
        </>
      </DialogContent>
      <DialogActions>
        <Button onClick={onJoin} variant="contained" aria-label="dialog-join">
          {t('components.application-button.join')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default PreJoinDialog;
