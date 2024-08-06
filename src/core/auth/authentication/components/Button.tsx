import { Button, ButtonProps } from '@mui/material';

export interface AuthActionButtonProps extends ButtonProps {
  justifyContent?: 'start' | 'center';
}

const AuthActionButton = ({ justifyContent, variant = 'contained', ...props }: AuthActionButtonProps) => {
  return <Button variant={variant} sx={{ width: '100%', justifyContent }} {...(props as ButtonProps)} />;
};

export default AuthActionButton;
