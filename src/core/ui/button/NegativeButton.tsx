import { Button, alpha } from '@mui/material';
import { PropsWithChildren } from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const NegativeButton = ({ disabled, onClick, children }: PropsWithChildren<ButtonProps>) => {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant="outlined"
      color="error"
      sx={theme => ({
        bgcolor: 'background.default',
        '&:hover': {
          color: 'background.default',
          borderColor: 'error.main',
          bgcolor: alpha(theme.palette.error.main, 0.7),
        },
      })}
    >
      {children}
    </Button>
  );
};

export default NegativeButton;
