import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Button from './Button';
import { DialogActions, DialogContent, DialogTitle } from './dialog';

interface RelationRemoveModalProps {
  show: boolean;
  onCancel: () => void;
  text: string;
  onConfirm: () => void;
  title?: string;
}

const RemoveModal: FC<RelationRemoveModalProps> = ({ show, text, onCancel, title, onConfirm }) => {
  const { t } = useTranslation();
  const defaultTitle = t('components.remove-modal.title');

  return (
    <Dialog open={show} maxWidth="md" fullWidth aria-labelledby="remove-dialog-title">
      <DialogTitle id="remove-dialog-title" onClose={onCancel}>
        {title || defaultTitle}
      </DialogTitle>
      <DialogContent dividers>{text}</DialogContent>
      <DialogActions>
        <Button small variant={'negative'} onClick={onConfirm} text={t('buttons.remove')} />
      </DialogActions>
    </Dialog>
  );
};

export default RemoveModal;
