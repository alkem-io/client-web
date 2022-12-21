import React, { PropsWithChildren } from 'react';
import { DialogTitle as MuiDialogTitle, DialogTitleClasses, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { PageTitle } from '../../../../core/ui/typography';

export interface DialogTitleProps {
  onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  id?: string; // TODO deprecate, remove
  classes?: Partial<DialogTitleClasses>; // TODO deprecate, remove
}

const DialogTitle = ({ children, onClose, classes, ...other }: PropsWithChildren<DialogTitleProps>) => {
  return (
    <MuiDialogTitle
      {...other}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      classes={classes}
    >
      <PageTitle>{children}</PageTitle>
      {onClose && (
        <IconButton aria-label="close" onClick={onClose} size="medium">
          <Close />
        </IconButton>
      )}
    </MuiDialogTitle>
  );
};

export default DialogTitle;
