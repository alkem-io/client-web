import React, { forwardRef, ReactNode } from 'react';
import { AvatarProps, Box } from '@mui/material';
import ErrorHandlingAvatar from './ErrorHandlingAvatar';
import { gutters } from '../grid/utils';

export type Size = 'small' | 'medium' | 'regular' | 'large';

const AvatarSize: Record<Size, number> = {
  small: 1.5,
  medium: 2,
  regular: 3,
  large: 4,
};

export interface SizeableAvatarProps {
  size?: Size;
  overlay?: ReactNode;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps & SizeableAvatarProps>(({ size, sx, overlay, ...props }, ref) => {
  const avatarSize = size && AvatarSize[size];

  if (overlay) {
    return (
      <Box ref={ref} position="relative">
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
      ref={ref}
      sx={{
        borderRadius: 0.5,
        width: avatarSize && gutters(avatarSize),
        height: avatarSize && gutters(avatarSize),
        ...sx,
      }}
      {...props}
    />
  );
});

export default Avatar;
