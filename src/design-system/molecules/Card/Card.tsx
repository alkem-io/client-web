import React from 'react';
import { Card as MuiCard, CardContent, CardProps as MuiCardProps } from '@mui/material';

export interface CardProps extends Pick<MuiCardProps, 'children' | 'raised'> {}

export const Card: React.FC<CardProps> = ({ children, raised }) => {
  return (
    <MuiCard raised={raised}>
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
};
