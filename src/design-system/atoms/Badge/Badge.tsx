import React from 'react';
import { Badge as MuiBadge, BadgeProps as MuiBadgeProps } from '@mui/material';

export interface BadgeProps extends MuiBadgeProps {
  badgeContent?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ badgeContent, color = 'primary', children, ...props }) => {
  return (
    <MuiBadge badgeContent={badgeContent} color={color} {...props}>
      {children}
    </MuiBadge>
  );
};
