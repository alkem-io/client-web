import { Button, type ButtonProps } from '@mui/material';
import type { ButtonTypeMap } from '@mui/material/Button/Button';
import type React from 'react';

const FullWidthButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  sx,
  ...props
}: ButtonProps<D, P>) => <Button {...props} sx={{ ...sx, width: '100%' }} />;

export default FullWidthButton;
