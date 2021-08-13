import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { CircularProgress, CircularProgressProps } from '@material-ui/core';

interface SpinnerProps extends CircularProgressProps {}

const useStyles = createStyles(theme => ({
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
