import React, { FC } from 'react';
import { useTheme } from '@mui/material';

interface ButtonProps {
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: FC<ButtonProps> = ({ style = {}, onClick, children }) => {
  const theme = useTheme();

  return (
    <button
      style={{
        border: '0',
        boxShadow: 'none',
        cursor: 'pointer',
        flex: '0 0 auto',
        padding: '5px 10px',
        margin: '15px',
        borderRadius: theme.shape.borderRadius,
        ...theme.typography.button,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
