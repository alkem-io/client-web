import { Button, type ButtonProps } from '@mui/material';
import type { ButtonTypeMap } from '@mui/material/Button/Button';
import type React from 'react';

const ButtonNarrow = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ButtonProps<D, P>) => (
  <Button sx={{ whiteSpace: 'nowrap', paddingX: 0.2, '.MuiButton-startIcon': { marginRight: 0.4 } }} {...props} />
);

export default ButtonNarrow;
