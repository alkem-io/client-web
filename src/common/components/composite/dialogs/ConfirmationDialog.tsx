import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import TranslationKey from '../../../../types/TranslationKey';
import { DialogActions, DialogContent, DialogTitle } from '../../core/dialog';

export interface ConfirmationDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | React.ReactNode;
    contentId?: TranslationKey;
    content?: string;
    confirmButtonTextId?: TranslationKey;
    confirmButtonText?: string;
  };
  actions: {
    onCancel: () => void;
    onConfirm: () => void;
  };
  options: {
    show: boolean;
  };
  state?: {
    isLoading: boolean;
  };
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();

  const title = entities.titleId ? t(entities.titleId) : entities.title;
  if (!title) {
    throw new Error('The confirmation dialog needs a title provided');
  }
  const content = entities.contentId ? t(entities.contentId) : entities.content;
  if (!content) {
    throw new Error('The confirmation dialog needs text content provided');
  }
  const confirmButtonText = entities.confirmButtonTextId
    ? (t(entities.confirmButtonTextId) as string)
    : entities.confirmButtonText;
  if (!confirmButtonText) {
    throw new Error('The confirmation dialog needs button text content provided');
  }

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog" onClose={actions.onCancel}>
      <DialogTitle id="confirmation-dialog-title" onClose={actions.onCancel}>
        {title}
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        <LoadingButton
          variant="text"
          loading={state?.isLoading}
          disabled={state?.isLoading}
          onClick={actions.onConfirm}
        >
          {confirmButtonText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
