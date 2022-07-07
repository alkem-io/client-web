import { Button, ButtonProps } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { forwardRef } from 'react';

export interface UserAvatarProps extends ButtonProps {
  name: string;
  src: string | undefined;
  className?: string;
  onClick?: () => void;
}

const UserAvatar = forwardRef<HTMLButtonElement, UserAvatarProps>(({ name, src, className, ...buttonProps }, ref) => {
  return (
    <Button key={-1} className={className} ref={ref} {...buttonProps} startIcon={<Avatar src={src} />}>
      {name}
    </Button>
  );
});

export default UserAvatar;
