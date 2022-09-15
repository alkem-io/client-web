import Dialog from '@mui/material/Dialog';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../../../../types/TranslationKey';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import QRCode from '../../../core/QRCode/QRCode';
import { makeStyles } from '@mui/styles';

interface QRCodeDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | React.ReactNode;
    contentId?: TranslationKey;
    content?: string;
    qrCodeJwt?: string;
    qrCodeImg?: string;
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

const useStyles = makeStyles({
  paper: {
    height: '100vh',
  },
  content: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  qrCode: {
    flexGrow: 1,
  },
});

const QRCodeDialog: FC<QRCodeDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const title = entities.titleId ? t(entities.titleId) : entities.title;
  if (!title) {
    throw new Error('The confirmation dialog needs a title provided');
  }
  const content = entities.contentId ? t(entities.contentId) : entities.content;
  if (!content) {
    throw new Error('The confirmation dialog needs text content provided');
  }

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog" classes={{ paper: styles.paper }}>
      <DialogTitle id="confirmation-dialog-title" onClose={actions.onCancel}>
        {title}
      </DialogTitle>
      <DialogContent className={styles.content}>
        {content}
        {state?.isLoading && <Loading text="Generating credential request" />}
        {!state?.isLoading && entities.qrCodeJwt && (
          <QRCode qrCodeJwt={entities.qrCodeJwt} qrCodeImg={entities.qrCodeImg} className={styles.qrCode} />
        )}
        {!state?.isLoading && entities.qrCodeImg && <img src={entities.qrCodeImg} alt="qr code" />}
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
