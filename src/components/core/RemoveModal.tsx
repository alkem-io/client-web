import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import Button from './Button';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';

interface RelationRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  text: string;
  onConfirm: () => void;
  title?: string;
}

const RemoveModal: FC<RelationRemoveModalProps> = ({ show, text, onCancel, title = 'Confirm remove', onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={show} maxWidth="md" fullWidth aria-labelledby="remove-dialog-title">
      <DialogTitle id="remove-dialog-title" onClose={onCancel}>
        {title}
      </DialogTitle>
      <DialogContent dividers>{text}</DialogContent>
      <DialogActions>
        <Button small variant={'negative'} onClick={onConfirm} text={t('buttons.remove')} />
      </DialogActions>
    </Dialog>
  );
};

export default RemoveModal;
