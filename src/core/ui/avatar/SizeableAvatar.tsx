import React from 'react';
import { Avatar, AvatarProps } from '@mui/material';

type Size = 'large';

const AvatarSize: Record<Size, number> = {
  large: 8,
};

export interface SizeableAvatarProps {
  size?: Size;
}

const SizeableAvatar = ({ size = 'large', sx, ...props }: AvatarProps & SizeableAvatarProps) => {
  const avatarSize = size && AvatarSize[size];

  return (
    <Avatar
      sx={{
        borderRadius: 0.5,
        width: avatarSize && (theme => theme.spacing(avatarSize)),
        height: avatarSize && (theme => theme.spacing(avatarSize)),
        ...sx,
      }}
      {...props}
    />
  );
};

export default SizeableAvatar;
