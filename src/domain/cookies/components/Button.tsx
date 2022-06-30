import React, { FC } from 'react';
import { Button as MUIButton, SxProps } from '@mui/material';

interface ButtonProps {
  sx?: SxProps;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ConsentButton: FC<ButtonProps> = ({ sx: style = {}, onClick, children }) => {
  // const theme = useTheme();

  return (
    <MUIButton
      sx={{
        paddingX: 2,
        paddingY: 0.5,
        margin: 2,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </MUIButton>
  );
};

export default ConsentButton;
