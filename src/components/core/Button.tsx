import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
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

    '&:hover': {
      textDecoration: 'none',
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
      },
    },

    '&:focus': {
      outline: `1px auto ${theme.palette.primary}`,
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
      outline: `1px auto ${theme.palette.primary}`,

      '&.inset': {
        outline: 'none',
      },
    },
  },
}));

interface ButtonProps extends Record<string, unknown> {
  paddingClass?: string;
  className?: string;
  classes?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: React.ComponentType<any>;
  onClick?: (e: Event) => void;
  text: string;
  variant?: 'default' | 'primary' | 'transparent';
  inset?: boolean;
  small?: boolean;
}

const Button: FC<ButtonProps> = ({
  className,
  classes = {},
  variant = 'default',
  inset = false,
  small = false,
  children,
  as: Component = 'button',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
  text,
  ...rest
}) => {
  const styles = useButtonStyles(classes);

  // can always use the bootstrap button internally
  return (
    <Component
      className={clsx(styles.button, styles[variant], inset && 'inset', small && 'small', className)}
      type="button"
      onClick={onClick}
      {...rest}
    >
      <Typography variant="button" color="inherit" weight="boldLight">
        {text}
      </Typography>
      {children}
    </Component>
  );
};

export default Button;
