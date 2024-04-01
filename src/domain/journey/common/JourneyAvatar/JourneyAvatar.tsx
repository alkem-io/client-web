import React from 'react';
import { SxProps, Theme } from '@mui/material';
import Avatar, { SizeableAvatarProps } from '../../../../core/ui/avatar/Avatar';
import defaultJourneyAvatar from '../../defaultVisuals/Avatar.jpg';

interface JourneyAvatarProps extends SizeableAvatarProps {
  src: string | undefined;
  sx?: SxProps<Theme> | undefined;
}

const JourneyAvatar = ({ src, size = 'large', ...props }: JourneyAvatarProps) => {
  return <Avatar size={size} src={src || defaultJourneyAvatar} {...props} />;
};

export default JourneyAvatar;
