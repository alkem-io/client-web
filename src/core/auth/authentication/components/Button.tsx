import { Button, ButtonProps } from '@mui/material';

export interface AuthActionButtonProps extends ButtonProps {
  justifyContent?: 'start' | 'center';
}

const AuthActionButton = ({ disabled, justifyContent, variant = 'contained', sx, ...props }: AuthActionButtonProps) => {
  return (
    <Button
      disabled={disabled}
      variant={variant}
      sx={{ width: '100%', justifyContent, ...sx }}
      {...(props as ButtonProps)}
    />
  );
};

export default AuthActionButton;
