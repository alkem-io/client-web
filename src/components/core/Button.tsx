import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useButtonStyles = createStyles(theme => ({
  button: {
    padding: `${theme.shape.spacing(1.5)}px ${theme.shape.spacing(2)}px`,
    display: 'flex',
    flexDirection: 'row',
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    transition: 'background-color 0.5s ease-out',
    borderStyle: 'double',
  },
  primary: {
    color: theme.palette.primary,
    borderColor: theme.palette.primary,
    background: 'transparent',

    '&:hover': {
      color: theme.palette.neutralLight,
      background: theme.palette.primary,
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
}

const Button: FC<ButtonProps> = ({ classes, children, as, onClick, text }) => {
  const styles = useButtonStyles();
  as = as || 'button';

  // can always use the bootstrap button internally
  return React.createElement(as, {
    className: clsx(styles.button, styles.primary, classes),
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
