import React, { FC } from 'react';
import { makeStyles } from '@mui/styles';

const useMainStyles = makeStyles(theme => ({
  backdrop: {
    backgroundColor: theme.palette.background.paper,
    opacity: 0.5,
    filter: `blur(${theme.spacing(0.5)})`,
    '-webkit-filter': `blur(${theme.spacing(0.5)})`,
    '-moz-filter': `blur(${theme.spacing(0.5)})`,
    '-o-filter': `blur(${theme.spacing(0.5)})`,
    '-ms-filter': `blur(${theme.spacing(0.5)})`,
  },
}));

export const Backdrop: FC = ({ children }) => {
  const styles = useMainStyles();

  return <div className={styles.backdrop}>{children}</div>;
};

export default Backdrop;
