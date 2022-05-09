import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React, { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../../common/components/core';
import DeleteButton from '../../shared/components/DeleteButton';

interface ConfirmationDialogProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

// TODO make customizable / reusable
const ConfirmationDialog = ({
  open,
  title,
  loading = false,
  onClose,
  onConfirm,
  children,
}: PropsWithChildren<ConfirmationDialogProps>) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} color="error">
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="primary">
          {loading ? <Loading /> : children}
        </Typography>
        <DialogActions sx={{ p: 0, marginTop: 2 }}>
          <Button variant="contained" onClick={onClose}>
            {t('buttons.cancel')}
          </Button>
          <DeleteButton onClick={onConfirm} disabled={loading} />
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
