import React, { ReactNode } from 'react';
import { AvatarProps, Box } from '@mui/material';
import ErrorHandlingAvatar from './ErrorHandlingAvatar';
import { gutters } from '../grid/utils';

type Size = 'small' | 'medium' | 'large';

const AvatarSize: Record<Size, number> = {
  small: 1.5,
  medium: 2,
  large: 4,
};

export interface SizeableAvatarProps {
  size?: Size;
  overlay?: ReactNode;
}

const Avatar = ({ size, sx, overlay, ...props }: AvatarProps & SizeableAvatarProps) => {
  const avatarSize = size && AvatarSize[size];

  if (overlay) {
    return (
      <Box position="relative">
        <Avatar size={size} sx={sx} {...props} />
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {overlay}
        </Box>
      </Box>
    );
  }

  return (
    <ErrorHandlingAvatar
      sx={{
        borderRadius: 0.5,
        width: avatarSize && gutters(avatarSize),
        height: avatarSize && gutters(avatarSize),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Avatar;
