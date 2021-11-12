import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import React, { FC, forwardRef } from 'react';

export interface ButtonProps extends MuiButtonProps {
  // paddingClass?: string;
  // className?: string;
  // classes?: unknown;
  // classOverrides?: MuiButtonProps['classes'];
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // as?: React.ComponentType<any> | string;
  // startIcon?: React.ReactNode;
  // to?: string;
  // onClick?: (e: Event) => void;
  // text?: string;
  // variant?: 'default' | 'primary' | 'negative' | 'transparent' | 'semiTransparent' | 'whiteStatic';
  // inset?: boolean;
  // small?: boolean;
  // block?: boolean;
  // disabled?: boolean;
}

const Button: FC<ButtonProps> = forwardRef((props, ref) => {
  // const styles = useStyles(classes);

  // const props = {
  //   type: 'button',
  //   onClick,
  //   ...rest,
  // };

  return <MuiButton ref={ref} {...props} />;
});

export default Button;
