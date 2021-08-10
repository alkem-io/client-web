import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';

const useIconButtonStyles = createStyles(theme => ({
  button: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 0,
    transition: 'background-color 0.5s ease-out',
    borderStyle: 'none',

    '&:hover': {
      textDecoration: 'none',
    },
    '&:focus': {
      outline: 'none',
    },
  },
  primary: {
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    background: 'transparent',
    transition: 'color 0.5s ease-out',

    '&:hover': {
      color: hexToRGBA(theme.palette.primary.main, 0.5),
    },

    '&:focus': {
      outline: 'none',
    },
  },
  disabled: {
    color: theme.palette.neutralMedium.main,
    borderColor: theme.palette.neutralLight.main,
    background: 'transparent',
    opacity: 0.8,
    transition: 'color 0.5s ease-out',
    cursor: 'default',

    '&:hover': {
      color: hexToRGBA(theme.palette.neutralMedium.main, 0.7),
    },

    '&:focus': {
      outline: 'none',
    },
  },
}));

interface ButtonProps extends Record<string, unknown> {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: React.ComponentType<any>;
  onClick?: (e: Event) => void;
  hoverIcon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}

const IconButton: FC<ButtonProps> = ({
  className,
  children,
  hoverIcon,
  disabled,
  as: Component = 'button',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
  ...rest
}) => {
  const styles = useIconButtonStyles();
  const [hover, setHover] = useState(false);

  const toggleHover = () => setHover(x => !x);

  const props = disabled
    ? {}
    : {
        onClick,
        onMouseEnter: toggleHover,
        onMouseLeave: toggleHover,
        ...rest,
      };

  Component = disabled ? 'button' : Component;

  // can always use the bootstrap button internally
  return (
    <Component
      className={clsx(styles.button, styles.primary, disabled && styles.disabled, className)}
      type={'button'}
      {...props}
    >
      {(hover && hoverIcon) || children}
    </Component>
  );
};

export default IconButton;
