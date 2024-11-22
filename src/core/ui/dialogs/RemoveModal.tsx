import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import WrapperButton from '../button/deprecated/WrapperButton';
import { DialogActions, DialogContent, DialogTitle } from '../dialog/deprecated';

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
        <WrapperButton small variant={'negative'} onClick={onConfirm} text={t('buttons.remove')} />
      </DialogActions>
    </Dialog>
  );
};

export default RemoveModal;
