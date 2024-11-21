import React, { forwardRef } from 'react';
import { SxProps, Theme } from '@mui/material';
import Avatar, { AvatarSize, SizeableAvatarProps } from '@/core/ui/avatar/Avatar';
import defaultJourneyAvatar from '../../defaultVisuals/Avatar.jpg';

interface JourneyAvatarProps extends SizeableAvatarProps {
  src: string | undefined;
  sx?: SxProps<Theme> | undefined;
  size?: AvatarSize;
}

const JourneyAvatar = forwardRef<HTMLDivElement, JourneyAvatarProps>(({ src, size = 'large', ...props }, ref) => {
  return <Avatar ref={ref} size={size} src={src || defaultJourneyAvatar} {...props} />;
});

export default JourneyAvatar;
