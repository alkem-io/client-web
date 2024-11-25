import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { ButtonTypeMap } from '@mui/material/Button/Button';

const ButtonNarrow = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ButtonProps<D, P>) => (
  <Button sx={{ whiteSpace: 'nowrap', paddingX: 0.2, '.MuiButton-startIcon': { marginRight: 0.4 } }} {...props} />
);

export default ButtonNarrow;
