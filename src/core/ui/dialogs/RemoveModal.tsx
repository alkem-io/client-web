import { DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import NegativeButton from '../button/NegativeButton';
import { DialogActions, DialogTitle } from '../dialog/deprecated';

type RelationRemoveModalProps = {
  show: boolean;
  onCancel: () => void;
  text: string;
  onConfirm: () => void;
  title?: string;
};

const RemoveModal = ({ show, text, onCancel, title, onConfirm }: RelationRemoveModalProps) => {
  const { t } = useTranslation();
  const defaultTitle = t('components.remove-modal.title');

  return (
    <Dialog open={show} maxWidth="md" fullWidth aria-labelledby="remove-dialog-title">
      <DialogTitle id="remove-dialog-title" onClose={onCancel}>
        {title || defaultTitle}
      </DialogTitle>
      <DialogContent dividers>{text}</DialogContent>
      <DialogActions>
        <NegativeButton onClick={onConfirm}>{t('buttons.remove')}</NegativeButton>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveModal;
