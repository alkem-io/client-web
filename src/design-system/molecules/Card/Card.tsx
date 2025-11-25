import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardMedia,
  CardActions,
  CardProps as MuiCardProps,
  CardHeaderProps,
  CardMediaProps,
  CardActionsProps,
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  header?: React.ReactElement<CardHeaderProps>;
  media?: React.ReactElement<CardMediaProps>;
  actions?: React.ReactElement<CardActionsProps>;
}

export const Card: React.FC<CardProps> = ({ header, media, actions, children, ...props }) => {
  return (
    <MuiCard {...props}>
      {header}
      {media}
      <CardContent>{children}</CardContent>
      {actions}
    </MuiCard>
  );
};

export { CardHeader, CardMedia, CardActions, CardContent };
