import { Button as MUIButton, ButtonProps } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ComponentType, forwardRef } from 'react';

export interface UserAvatarProps extends ButtonProps {
  name: string;
  src: string | undefined;
  className?: string;
  onClick?: () => void;
  buttonComponent?: ComponentType<ButtonProps>;
}

const UserAvatar = forwardRef<HTMLButtonElement, UserAvatarProps>(
  ({ name, buttonComponent: Button = MUIButton, src, className, ...buttonProps }, ref) => {
    return (
      <Button className={className} ref={ref} {...buttonProps} startIcon={<Avatar src={src} />}>
        {name}
      </Button>
    );
  }
);

export default UserAvatar;
