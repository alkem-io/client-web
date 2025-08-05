import { ButtonBase, ButtonBaseProps } from '@mui/material';
import { ButtonBaseTypeMap } from '@mui/material/ButtonBase/ButtonBase';

const ButtonBaseAlignReset = <D extends React.ElementType = ButtonBaseTypeMap['defaultComponent'], P = {}>({
  ref,
  sx,
  ...props
}: ButtonBaseProps<D, P> & {
  ref?: React.Ref<HTMLButtonElement>;
}) => <ButtonBase ref={ref} {...props} sx={{ textAlign: 'initial', ...sx }} />;

export default ButtonBaseAlignReset;
