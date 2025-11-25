import React from 'react';
import { LinearProgress, LinearProgressProps } from '@mui/material';

export interface ProgressBarProps extends LinearProgressProps {}

export const ProgressBar: React.FC<ProgressBarProps> = props => {
  return <LinearProgress {...props} />;
};
