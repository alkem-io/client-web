import { IconButton, type IconButtonProps } from '@mui/material';
import type { IconButtonTypeMap } from '@mui/material/IconButton/IconButton';
import type React from 'react';

const NavigationItemButton = <D extends React.ElementType = IconButtonTypeMap['defaultComponent'], P = {}>({
  sx,
  ...props
}: IconButtonProps<D, P>) => <IconButton sx={{ borderRadius: 'unset', ...sx }} {...props} />;

export default NavigationItemButton;
