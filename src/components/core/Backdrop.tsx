import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useMainStyles = createStyles(theme => ({
  backdrop: {
    backgroundColor: theme.palette.background,
    opacity: 0.5,
    display: 'flex',
    filter: `blur(${theme.shape.spacing(0.5)}px)`,
    '-webkit-filter': `blur(${theme.shape.spacing(0.5)}px)`,
    '-moz-filter': `blur(${theme.shape.spacing(0.5)}px)`,
    '-o-filter': `blur(${theme.shape.spacing(0.5)}px)`,
    '-ms-filter': `blur(${theme.shape.spacing(0.5)}px)`,
  },
}));

export const Backdrop: FC = ({ children }) => {
  const styles = useMainStyles();

  return <div className={styles.backdrop}>{children}</div>;
};

export default Backdrop;
