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
      background: hexToRGBA(theme.palette.primary, 0.7),
    },

    '&:focus': {
      outline: `1px auto ${theme.palette.primary}`,
    },
  },
}));

interface ButtonProps {
  paddingClass?: string;
  classes?: string;
  as?: string;
  onClick: (e: Event) => void;
  text: string;
  variant?: 'default' | 'primary';
  inset?: boolean;
  small?: boolean;
}

const Button: FC<ButtonProps> = ({
  classes,
  variant = 'default',
  inset = false,
  small = false,
  children,
  as,
  onClick,
  text,
}) => {
  const styles = useButtonStyles();
  as = as || 'button';

  // can always use the bootstrap button internally
  return React.createElement(as, {
    className: clsx(styles.button, styles[variant], inset && 'inset', small && 'small', classes),
    children: (
      <>
        <Typography variant="button" color="inherit" weight="boldLight">
          {text}
        </Typography>
        {children}
      </>
    ),
    type: 'button',
    onClick,
  });
};

export default Button;
