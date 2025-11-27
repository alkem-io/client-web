import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';

export interface AvatarProps extends MuiAvatarProps {
  alt: string;
  src?: string;
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ alt, src, children, ...props }) => {
  return (
    <MuiAvatar alt={alt} src={src} {...props}>
      {children}
    </MuiAvatar>
  );
};
