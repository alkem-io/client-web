import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useIconButtonStyles = createStyles(theme => ({
  button: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 0,
    transition: 'background-color 0.5s ease-out',
    borderStyle: 'none',
  },
  primary: {
    color: theme.palette.primary,
    borderColor: theme.palette.primary,
    background: 'transparent',

    // '&:hover': {
    //   color: theme.palette.neutralLight,
    //   background: theme.palette.primary,
    // },

    '&:focus': {
      outline: 'none',
    },
  },
}));

interface ButtonProps {
  className?: string;
  as?: string;
  onClick: (e: Event) => void;
  hoverIcon?: React.ReactNode;
  children: React.ReactNode;
}

const IconButton: FC<ButtonProps> = ({ className, children, hoverIcon, as, onClick }) => {
  const styles = useIconButtonStyles();
  const [hover, setHover] = useState(false);

  const toggleHover = () => setHover(x => !x);

  as = as || 'button';

  // can always use the bootstrap button internally
  return React.createElement(as, {
    className: clsx(styles.button, styles.primary, className),
    children: <>{(hover && hoverIcon) || children}</>,
    type: 'button',
    onClick,
    onMouseEnter: toggleHover,
    onMouseLeave: toggleHover,
  });
};

export default IconButton;
