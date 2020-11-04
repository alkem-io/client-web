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
