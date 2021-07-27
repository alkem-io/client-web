import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks';
import hexToRGBA from '../../utils/hexToRGBA';
import Typography from './Typography';

const useButtonStyles = createStyles(theme => ({
  button: {
    padding: `${theme.shape.spacing(1.5)}px ${theme.shape.spacing(2)}px`,
    display: 'inline-flex',
    width: 'auto',
    flexDirection: 'row',
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    transition: 'background-color 0.5s ease-out',
    borderStyle: 'double',

    '&.inset': {
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderRadius: 0,
    },
    '&.small': {
      padding: `${theme.shape.spacing(0.5)}px ${theme.shape.spacing(1)}px`,
    },

    '&.block': {
      display: 'block',
      width: '100%',
    },

    '&:hover': {
      textDecoration: 'none',
    },
    '&:focus': {
      outline: 'none',
    },
  },
  default: {
    color: theme.palette.primary,
    borderColor: theme.palette.primary,
    background: theme.palette.background,

    '&:hover': {
      color: theme.palette.neutralLight,
      background: theme.palette.primary,
    },

    '&:focus': {
      outline: `1px auto ${theme.palette.primary}`,

      '&.inset': {
        outline: 'none',
      },
    },
  },
  primary: {
    color: theme.palette.neutralLight,
    borderColor: theme.palette.primary,
    background: theme.palette.primary,

    '&:hover': {
      color: theme.palette.neutralLight,
      background: hexToRGBA(theme.palette.primary, 0.7),
    },

    '&.inset': {
      borderColor: theme.palette.neutralLight,
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',

      '&:hover': {
        color: theme.palette.primary,
        background: theme.palette.background,
        cursor: 'pointer',
      },

      '&:focus': {
        outline: 'none',
      },
    },
  },
  whiteStatic: {
    color: theme.palette.background,
    borderColor: theme.palette.background,
    background: 'transparent',

    '&.inset': {
      '&:focus': {
        outline: 'none',
      },
    },
  },
  transparent: {
    color: theme.palette.primary,
    borderColor: theme.palette.primary,
    background: 'transparent',

    '&:hover': {
      color: theme.palette.neutralLight,
      background: hexToRGBA(theme.palette.primary, 0.7),
    },

    '&:focus': {
      '&.inset': {
        outline: 'none',
      },
    },
  },
  semiTransparent: {
    color: theme.palette.background,
    borderColor: theme.palette.primary,
    background: hexToRGBA(theme.palette.background, 0.25),

    '& > div': {
      filter: `drop-shadow(1px 1px ${theme.palette.neutral})`,
    },

    '&:hover': {
      color: theme.palette.neutralLight,
      background: hexToRGBA(theme.palette.primary, 0.7),
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
    color: theme.palette.negative,
    borderColor: theme.palette.negative,
    background: theme.palette.background,

    '&:hover': {
      color: theme.palette.neutralLight,
      background: hexToRGBA(theme.palette.negative, 0.7),
    },

    '&.inset': {
      borderColor: theme.palette.neutralLight,
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',

      '&:hover': {
        color: theme.palette.negative,
        background: theme.palette.background,
        cursor: 'pointer',
      },

      '&:focus': {
        outline: 'none',
      },
    },
  },
  disabled: {
    color: theme.palette.background,
    borderColor: theme.palette.neutralLight,
    background: theme.palette.neutralMedium,
    opacity: 0.8,
    cursor: 'default',

    '&:hover': {
      color: theme.palette.background,
      background: hexToRGBA(theme.palette.neutralMedium, 0.7),
      cursor: 'not-allowed',
    },

    '&:focus': {
      '&.inset': {
        outline: 'none',
      },
    },
  },
}));

export interface ButtonProps extends Record<string, unknown> {
  paddingClass?: string;
  className?: string;
  classes?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: React.ComponentType<any> | string;
  onClick?: (e: Event) => void;
  text?: string;
  variant?: 'default' | 'primary' | 'negative' | 'transparent' | 'semiTransparent' | 'whiteStatic';
  inset?: boolean;
  small?: boolean;
  block?: boolean;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({
  className,
  classes = {},
  variant = 'default',
  inset = false,
  small = false,
  block = false,
  disabled = false,
  children,
  as: Component = 'button',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
  text,
  ...rest
}) => {
  const styles = useButtonStyles(classes);

  const props = disabled
    ? {}
    : {
        type: 'button',
        onClick,
        ...rest,
      };

  // can always use the bootstrap button internally
  return (
    <Component
      className={clsx(
        styles.button,
        styles[variant],
        inset && 'inset',
        small && 'small',
        block && 'block',
        disabled && styles.disabled,
        className
      )}
      {...props}
    >
      <Typography variant="button" color="inherit" weight="boldLight">
        {text}
      </Typography>
      {children}
    </Component>
  );
};

export default Button;
