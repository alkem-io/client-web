import React from 'react';
import { IconButton, IconButtonProps } from '@mui/material';

const NavigationItemButton = ({ sx, ...props }: IconButtonProps) => {
  return <IconButton sx={{ borderRadius: theme => `${theme.shape.borderRadius}px`, ...sx }} {...props} />;
};

export default NavigationItemButton;
