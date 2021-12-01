import Dialog from '@mui/material/Dialog';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../../types/TranslationKey';
import { Loading } from '../../core';
import Button from '../../core/Button';
import { DialogActions, DialogContent, DialogTitle } from '../../core/dialog';

interface ConfirmationDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string;
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
    <Dialog open={options.show} aria-labelledby="confirmation-dialog">
      <DialogTitle id="confirmation-dialog-title" onClose={actions.onCancel}>
        {title}
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        {state?.isLoading ? (
          <Loading text={'Loading ...'} />
        ) : (
          <Button
            small
            variant={'negative'}
            onClick={actions.onConfirm}
            disabled={state?.isLoading}
            text={confirmButtonText}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
