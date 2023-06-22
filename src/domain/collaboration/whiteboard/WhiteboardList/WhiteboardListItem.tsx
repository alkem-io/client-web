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
import { AuthorizationPrivilege, WhiteboardDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../shared/types/Identifiable';

const useStyles = makeStyles(theme => ({
  active: {
    background: alpha(theme.palette.primary.light, 0.5),
  },
}));

export interface WhiteboardListItemWhiteboard extends Identifiable {
  displayName: string;
  authorization?: WhiteboardDetailsFragment['authorization'];
  checkout?: WhiteboardDetailsFragment['checkout'];
}

interface WhiteboardListItemProps extends ListItemButtonProps {
  whiteboard: WhiteboardListItemWhiteboard;
  onDelete?: (whiteboard: WhiteboardListItemWhiteboard) => void;
  canDelete?: boolean;
  isSelected?: boolean;
}

export const WhiteboardListItemSkeleton: FC<ListItemProps> = props => {
  return (
    <ListItem {...props}>
      <ListItemAvatar sx={{ display: 'flex' }}>
        <Skeleton variant="circular" sx={{ width: '1.2em' }} />
      </ListItemAvatar>
      <ListItemText primary={<Skeleton variant="text" />} />
    </ListItem>
  );
};

export const WhiteboardListItem: FC<WhiteboardListItemProps> = ({
  whiteboard,
  canDelete,
  isSelected,
  onDelete,
  ...rest
}) => {
  const hasDeletePermissions = whiteboard.authorization?.myPrivileges?.some(x => x === AuthorizationPrivilege.Delete);

  const styles = useStyles();

  return (
    <ListItemButton {...rest} className={clsx(isSelected && styles.active)}>
      <ListItemText primary={whiteboard.displayName} />
      <ListItemSecondaryAction>
        {canDelete && hasDeletePermissions && onDelete && (
          <IconButton
            onClick={e => {
              e.stopPropagation();
              onDelete(whiteboard);
            }}
          >
            <Delete />
          </IconButton>
        )}
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};

export default WhiteboardListItem;
