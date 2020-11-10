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
  },
  primary: {
    color: theme.palette.primary,
    borderColor: theme.palette.primary,
    background: 'transparent',
    transition: 'color 0.5s ease-out',

    '&:hover': {
      color: hexToRGBA(theme.palette.primary, 0.5),
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
  children: React.ReactNode;
}

const IconButton: FC<ButtonProps> = ({
  className,
  children,
  hoverIcon,
  as: Component = 'button',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
  ...rest
}) => {
  const styles = useIconButtonStyles();
  const [hover, setHover] = useState(false);

  const toggleHover = () => setHover(x => !x);

  // can always use the bootstrap button internally
  return (
    <Component
      className={clsx(styles.button, styles.primary, className)}
      type={'button'}
      onClick={onClick}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
      {...rest}
    >
      {(hover && hoverIcon) || children}
    </Component>
  );
};

export default IconButton;
