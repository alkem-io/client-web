import React, { FC } from 'react';
import { Button as MUIButton, SxProps } from '@mui/material';

interface ButtonProps {
  sx?: SxProps;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const CloseButton: FC<ButtonProps> = ({ sx = {}, onClick, children }) => {
  return (
    <MUIButton
      sx={{
        paddingX: 0.5,
        paddingY: 0.5,
        ...sx,
      }}
      onClick={onClick}
    >
      {children}
    </MUIButton>
  );
};

export default CloseButton;
