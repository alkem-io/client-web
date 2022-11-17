import { Button, ButtonProps } from '@mui/material';

export interface AuthActionButtonProps extends Omit<ButtonProps, 'color'> {
  color?: ButtonProps['color'] | 'primaryDark';
  justifyContent?: 'start' | 'center';
}

const AuthActionButton = ({ justifyContent, ...props }: AuthActionButtonProps) => {
  return <Button variant="contained" sx={{ width: '100%', justifyContent }} {...(props as ButtonProps)} />;
};

export default AuthActionButton;
