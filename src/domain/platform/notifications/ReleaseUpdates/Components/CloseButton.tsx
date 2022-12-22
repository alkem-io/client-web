import React, { FC } from 'react';
import { IconButton, SxProps } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ButtonProps {
  sx?: SxProps;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const CloseButton: FC<ButtonProps> = ({ onClick }) => {
  return (
    <IconButton size="small" onClick={onClick} sx={{ marginRight: -1 }}>
      <Close color="primary" />
    </IconButton>
  );
};

export default CloseButton;
