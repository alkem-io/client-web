import React, { FC } from 'react';
import { Button as MUIButton, SxProps } from '@mui/material';

interface ButtonProps {
  sx?: SxProps;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: FC<ButtonProps> = ({ sx = {}, onClick, children }) => {
  return (
    <MUIButton
      sx={{
        paddingX: 2,
        paddingY: 0.5,
        margin: 2,
        ...sx,
      }}
      onClick={onClick}
    >
      {children}
    </MUIButton>
  );
};

export default Button;
