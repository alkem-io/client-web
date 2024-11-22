import React from 'react';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { Button, ButtonProps } from '@mui/material';

const FullWidthButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  sx,
  ...props
}: ButtonProps<D, P>) => <Button {...props} sx={{ ...sx, width: '100%' }} />;

export default FullWidthButton;
