import NegativeButton from '@/core/ui/button/NegativeButton';
import { DialogActions, DialogTitle } from '@/core/ui/dialog/deprecated';
import Loading from '@/core/ui/loading/Loading';
import { Dialog, DialogContent } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
          <NegativeButton onClick={onConfirm} disabled={loading}>
            {t('buttons.remove')}
          </NegativeButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserRemoveModal;
