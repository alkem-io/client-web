import React, { FC } from 'react';
import { CircularProgress, CircularProgressProps } from '@mui/material';

interface SpinnerProps extends CircularProgressProps {}

// TODO [ATS]: Used on one place, needs review.
export const Spinner: FC<SpinnerProps> = props => {
  return (
    <CircularProgress
      sx={{
        spinner: {
          color: theme => theme.palette.primary.main,
        },
      }}
      {...props}
    />
  );
};

export default Spinner;
