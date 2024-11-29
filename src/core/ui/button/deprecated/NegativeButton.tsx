import { Button, alpha } from '@mui/material';
import { PropsWithChildren } from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * @deprecated - Please use MUI Button directly
 */
const NegativeButton = ({ disabled, onClick, children }: PropsWithChildren<ButtonProps>) => {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant="outlined"
      sx={theme => ({
        color: theme.palette.error.main,
        borderColor: theme.palette.error.main,
        background: theme.palette.background.default,
        '&:hover': {
          color: theme.palette.background.default,
          borderColor: theme.palette.error.main,
          background: alpha(theme.palette.error.main, 0.7),
        },
      })}
    >
      {children}
    </Button>
  );
};

export default NegativeButton;
