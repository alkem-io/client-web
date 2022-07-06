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
  alpha,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import { AuthorizationPrivilege, CanvasCheckoutStateEnum } from '../../../../models/graphql-schema';

const useStyles = makeStyles(theme => ({
  active: {
    background: alpha(theme.palette.primary.light, 0.5),
  },
}));

interface CanvasListItemProps extends ListItemButtonProps {
  entities: {
    canvas: CanvasWithoutValue;
  };
  actions: {
    onDelete?: (canvas: CanvasWithoutValue) => void;
  };
  options: {
    canDelete?: boolean;
    isSelected?: boolean;
  };
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

export const CanvasItemState: FC<{ canvas?: CanvasWithoutValue; isSelected?: boolean }> = props => {
  const { t } = useTranslation();

  if (props.isSelected) {
    return <CircleIcon color="disabled" />;
  }

  const { canvas } = props;
  switch (canvas?.checkout?.status) {
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
  const { canDelete, isSelected } = options;
  const { onDelete } = actions;

  const hasDeletePermissions = canvas.authorization?.myPrivileges?.some(x => x === AuthorizationPrivilege.Delete);

  const styles = useStyles();

  return (
    <ListItemButton {...rest} className={clsx(isSelected && styles.active)}>
      <ListItemAvatar sx={{ display: 'flex' }}>
        <CanvasItemState canvas={canvas} isSelected={isSelected} />
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
