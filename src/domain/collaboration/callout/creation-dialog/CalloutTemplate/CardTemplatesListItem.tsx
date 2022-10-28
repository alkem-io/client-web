import React, { FC } from 'react';
import {
  alpha,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemProps,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
  active: {
    background: alpha(theme.palette.primary.light, 0.5),
  },
}));

export interface CardTemplatesListItemType {
  type: string;
}

interface CanvasListItemProps extends ListItemButtonProps {
  cardTemplate: CardTemplatesListItemType;
  isSelected?: boolean;
}

export const CardTemplatesListItemSkeleton: FC<ListItemProps> = props => {
  return (
    <ListItem {...props}>
      <ListItemText primary={<Skeleton variant="text" />} />
    </ListItem>
  );
};

export const CardTemplateListItem: FC<CanvasListItemProps> = ({ cardTemplate, isSelected, ...rest }) => {
  const styles = useStyles();

  return (
    <ListItemButton {...rest} className={clsx(isSelected && styles.active)}>
      <ListItemText primary={cardTemplate.type} />
    </ListItemButton>
  );
};

export default CardTemplateListItem;
