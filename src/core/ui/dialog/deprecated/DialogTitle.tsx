import React, { PropsWithChildren } from 'react';
import { DialogTitle as MuiDialogTitle, DialogTitleClasses, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { PageTitle } from '../../typography';
import { useTranslation } from 'react-i18next';

export interface DialogTitleProps {
  onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  id?: string; // TODO deprecate, remove
  classes?: Partial<DialogTitleClasses>; // TODO deprecate, remove
}

/**
 * @deprecated - use DialogHeader
 */
const DialogTitle = ({ children, onClose, classes, ...containerProps }: PropsWithChildren<DialogTitleProps>) => {
  const { t } = useTranslation();
  return (
    <MuiDialogTitle
      {...containerProps}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      classes={classes}
    >
      <PageTitle sx={{ width: '100%' }}>{children}</PageTitle>
      {onClose && (
        <IconButton onClick={onClose} size="medium" aria-label={t('buttons.close')}>
          <Close />
        </IconButton>
      )}
    </MuiDialogTitle>
  );
};

export default DialogTitle;
