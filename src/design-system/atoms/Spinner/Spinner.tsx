import React from 'react';
import { CircularProgress, CircularProgressProps } from '@mui/material';

export interface SpinnerProps extends CircularProgressProps {}

export const Spinner: React.FC<SpinnerProps> = props => {
  return <CircularProgress {...props} />;
};
