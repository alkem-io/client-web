import Dialog from '@mui/material/Dialog';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../../../types/TranslationKey';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import QRCode from '../../../core/QRCode/QRCode';

interface QRCodeDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | React.ReactNode;
    contentId?: TranslationKey;
    content?: string;
    qrValue?: string | null;
  };
  actions: {
    onCancel: () => void;
    onConfirm?: () => void;
  };
  options: {
    show: boolean;
  };
  state?: {
    isLoading: boolean;
  };
}

const QRCodeDialog: FC<QRCodeDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();

  const title = entities.titleId ? t(entities.titleId) : entities.title;
  if (!title) {
    throw new Error('The confirmation dialog needs a title provided');
  }
  const content = entities.contentId ? t(entities.contentId) : entities.content;
  if (!content) {
    throw new Error('The confirmation dialog needs text content provided');
  }

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog">
      <DialogTitle id="confirmation-dialog-title" onClose={actions.onCancel}>
        {title}
      </DialogTitle>
      <DialogContent>
        {content}
        {state?.isLoading && <Loading text="Generating credential request" />}
        {!state?.isLoading && <QRCode value={entities.qrValue} />}
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
