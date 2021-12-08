import React, { FC } from 'react';
import { makeStyles } from '@mui/styles';
import { CircularProgress, CircularProgressProps } from '@mui/material';

interface SpinnerProps extends CircularProgressProps {}

const useStyles = makeStyles(theme => ({
  spinner: {
    color: theme.palette.primary.main,
  },
}));

// TODO [ATS]: Used on one place, needs review.
export const Spinner: FC<SpinnerProps> = ({ ...props }) => {
  const styles = useStyles();

  return <CircularProgress className={styles.spinner} {...props} />;
};
export default Spinner;
