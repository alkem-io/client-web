import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export interface ChipProps extends MuiChipProps {}

export const Chip: React.FC<ChipProps> = props => {
  return <MuiChip {...props} />;
};
