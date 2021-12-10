import { Delete } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import DoNotDisturbOnTotalSilenceIcon from '@mui/icons-material/DoNotDisturbOnTotalSilence';
import {
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemButtonProps,
  ListItemProps,
  ListItemSecondaryAction,
  ListItemText,
  Skeleton,
  Tooltip,
} from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import { AuthorizationPrivilege, CanvasCheckoutStateEnum } from '../../../../models/graphql-schema';

interface CanvasListItemProps extends ListItemButtonProps {
  entities: {
    canvas: CanvasWithoutValue;
  };
  actions: {
    onDelete?: (canvas: CanvasWithoutValue) => void;
  };
  options: {
    canDelete?: boolean;
  };
}

export const CanvasListItemSkeleton: FC<ListItemProps> = props => {
  return (
    <ListItem {...props}>
      <ListItemText primary={<Skeleton variant="text" />} />
    </ListItem>
  );
};

export const CanvasItemState: FC<{ canvas: CanvasWithoutValue }> = props => {
  const { t } = useTranslation();

  const { canvas } = props;
  switch (canvas.checkout?.status) {
    case CanvasCheckoutStateEnum.Available:
      return (
        <Tooltip title={t('pages.canvas.state.available')}>
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    case CanvasCheckoutStateEnum.CheckedOut:
      return (
        <Tooltip title={t('pages.canvas.state.checkedout')}>
          <DoNotDisturbOnTotalSilenceIcon color="warning" />
        </Tooltip>
      );
    default:
      return (
        <Tooltip title={t('pages.canvas.state.unknown')}>
          <CircleIcon color="disabled" />
        </Tooltip>
      );
  }
};

export const CanvasListItem: FC<CanvasListItemProps> = ({ entities, actions, options, ...rest }) => {
  const { canvas } = entities;
  const { canDelete } = options;
  const { onDelete } = actions;

  const hasDeletePermissions = canvas.authorization?.myPrivileges?.some(x => x === AuthorizationPrivilege.Delete);

  return (
    <ListItemButton {...rest}>
      <ListItemAvatar sx={{ display: 'flex' }}>
        <CanvasItemState canvas={canvas} />
      </ListItemAvatar>
      <ListItemText primary={canvas.name} />
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
