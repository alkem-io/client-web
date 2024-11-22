import clsx from 'clsx';
import React, { PropsWithChildren, forwardRef } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import hexToRGBA from '@/core/utils/hexToRGBA';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  whiteStatic: {
    color: theme.palette.background.default,
    borderColor: theme.palette.background.default,
    background: 'transparent',

    '&:hover': {
      background: 'transparent',
    },

    '&.inset': {
      '&:focus': {
        outline: 'none',
      },
    },
  },
  transparent: {
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    background: 'transparent',

    '&:hover': {
      color: theme.palette.background.default,
      background: hexToRGBA(theme.palette.primary.main, 0.7),
    },

    '&:focus': {
      '&.inset': {
        outline: 'none',
      },
    },
  },
  semiTransparent: {
    color: theme.palette.background.default,
    borderColor: theme.palette.primary.main,
    background: hexToRGBA(theme.palette.background.default, 0.25),

    '& > span': {
      filter: `drop-shadow(1px 1px ${theme.palette.neutral.main})`,
    },

    '&:hover': {
      color: theme.palette.background.default,
      background: hexToRGBA(theme.palette.primary.main, 0.7),
      filter: 'none',
    },

    '&:focus': {
      '&.inset': {
        outline: 'none',
      },
    },

    '&.inset': {
      borderColor: 'transparent',
    },
  },
  negative: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    background: theme.palette.background.default,

    '&:hover': {
      color: theme.palette.background.default,
      borderColor: theme.palette.error.main,
      background: hexToRGBA(theme.palette.error.main, 0.7),
    },

    '&.inset': {
      borderColor: theme.palette.background.default,
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',

      '&:hover': {
        color: theme.palette.error.main,
        background: theme.palette.background.paper,
        cursor: 'pointer',
      },

      '&:focus': {
        outline: 'none',
      },
    },
  },
}));

export interface ButtonProps extends Record<string, unknown> {
  paddingClass?: string;
  className?: string;
  classes?: unknown;
  classOverrides?: MuiButtonProps['classes'];
  as?: React.ElementType;
  startIcon?: React.ReactNode;
  to?: string;
  onClick?: (e: Event) => void;
  text?: string;
  variant?: 'default' | 'primary' | 'negative';
  inset?: boolean;
  small?: boolean;
  block?: boolean;
  disabled?: boolean;
}

/**
 * @deprecated - Please use MUI Button directly
 */
const WrapperButton = forwardRef(
  (
    {
      className,
      classes = {},
      classOverrides = {},
      variant = 'default',
      startIcon,
      inset = false,
      small = false,
      block = false,
      disabled = false,
      as: Component = 'button',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick = () => {},
      text,
      children,
      ...rest
    }: PropsWithChildren<ButtonProps>,
    ref
  ) => {
    const styles = useStyles(classes);

    const props = {
      type: 'button',
      onClick,
      ...rest,
    };

    return (
      <MuiButton
        ref={ref}
        className={clsx(className, inset && 'inset', small && 'small', block && 'block')}
        classes={{
          outlined: styles[variant],
          ...classOverrides,
        }}
        component={Component}
        variant="outlined"
        color={variant === 'primary' ? 'primary' : undefined}
        startIcon={startIcon}
        disabled={disabled}
        {...props}
      >
        {text && <span>{text}</span>}
        {children}
      </MuiButton>
    );
  }
);

export default WrapperButton;
