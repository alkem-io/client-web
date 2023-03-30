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

export interface PostTemplatesListItemType {
  type: string;
  title: string;
}

interface CanvasListItemProps extends ListItemButtonProps {
  postTemplate: PostTemplatesListItemType;
  isSelected?: boolean;
}

export const PostTemplatesListItemSkeleton: FC<ListItemProps> = props => {
  return (
    <ListItem {...props}>
      <ListItemText primary={<Skeleton variant="text" />} />
    </ListItem>
  );
};

export const PostTemplateListItem: FC<CanvasListItemProps> = ({ postTemplate, isSelected, ...rest }) => {
  const styles = useStyles();

  return (
    <ListItemButton {...rest} className={clsx(isSelected && styles.active)}>
      <ListItemText primary={postTemplate.title} />
    </ListItemButton>
  );
};

export default PostTemplateListItem;
