import { forwardRef } from 'react';
import { ButtonBase, ButtonBaseProps } from '@mui/material';
import { ButtonBaseTypeMap } from '@mui/material/ButtonBase/ButtonBase';

const ButtonBaseAlignReset = forwardRef(
  <D extends React.ElementType = ButtonBaseTypeMap['defaultComponent'], P = {}>(
    { sx, ...props }: ButtonBaseProps<D, P>,
    ref
  ) => <ButtonBase ref={ref} {...props} sx={{ textAlign: 'initial', ...sx }} />
);

export default ButtonBaseAlignReset;
