import React from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { IconButtonTypeMap } from '@mui/material/IconButton/IconButton';

const NavigationItemButton = <D extends React.ElementType = IconButtonTypeMap['defaultComponent'], P = {}>({
  sx,
  ...props
}: IconButtonProps<D, P>) => <IconButton sx={{ borderRadius: 'unset', ...sx }} {...props} />;

export default NavigationItemButton;
