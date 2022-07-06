import { Delete } from '@mui/icons-material';
import {
  alpha,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemButtonProps,
  ListItemProps,
  ListItemSecondaryAction,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { FC } from 'react';
import { AuthorizationPrivilege, CanvasDetailsFragment } from '../../../../models/graphql-schema';
import CanvasListItemState from './CanvasListItemState';

const useStyles = makeStyles(theme => ({
  active: {
    background: alpha(theme.palette.primary.light, 0.5),
  },
}));

interface CanvasListItemProps extends ListItemButtonProps {
  canvas: CanvasDetailsFragment;
  onDelete?: (canvas: CanvasDetailsFragment) => void;
  canDelete?: boolean;
  isSelected?: boolean;
}

export const CanvasListItemSkeleton: FC<ListItemProps> = props => {
  return (
    <ListItem {...props}>
      <ListItemAvatar sx={{ display: 'flex' }}>
        <Skeleton variant="circular" sx={{ width: '1.2em' }} />
      </ListItemAvatar>
      <ListItemText primary={<Skeleton variant="text" />} />
    </ListItem>
  );
};

export const CanvasListItem: FC<CanvasListItemProps> = ({ canvas, canDelete, isSelected, onDelete, ...rest }) => {
  const hasDeletePermissions = canvas.authorization?.myPrivileges?.some(x => x === AuthorizationPrivilege.Delete);

  const styles = useStyles();

  return (
    <ListItemButton {...rest} className={clsx(isSelected && styles.active)}>
      <ListItemAvatar sx={{ display: 'flex' }}>
        <CanvasListItemState canvas={canvas} isSelected={isSelected} />
      </ListItemAvatar>
      <ListItemText primary={canvas.displayName} />
      <ListItemSecondaryAction>
        {canDelete && hasDeletePermissions && onDelete && (
          <IconButton
            onClick={e => {
              e.stopPropagation();
              onDelete(canvas);
            }}
          >
            <Delete />
          </IconButton>
        )}
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};

export default CanvasListItem;
