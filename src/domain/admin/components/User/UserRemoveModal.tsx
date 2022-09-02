import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Button from '../../../../common/components/core/Button';
import { Loading } from '../../../../common/components/core';
import { DialogTitle, DialogContent, DialogActions } from '../../../../common/components/core/dialog';

interface UserRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  name: string | undefined;
  loading?: boolean;
}

const UserRemoveModal: FC<UserRemoveModalProps> = ({ show, onCancel, onConfirm, name, loading = false }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={show} maxWidth="md" fullWidth aria-labelledby="user-remove-dialog-title">
      <DialogTitle id="user-remove-dialog-title" onClose={onCancel}>
        Confirm user remove
      </DialogTitle>
      <DialogContent dividers>Are you sure you want to remove {name || 'user'}?</DialogContent>
      <DialogActions>
        {loading ? (
          <Loading text={'Loading ...'} />
        ) : (
          <Button small variant={'negative'} onClick={onConfirm} disabled={loading} text={t('buttons.remove')} />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserRemoveModal;
