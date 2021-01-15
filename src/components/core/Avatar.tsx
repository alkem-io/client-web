import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import Typography from './Typography';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import UserPopUp from '../Community/UserPopUp';

const useAvatarStyles = createStyles(theme => ({
  avatarWrapper: {
    display: 'flex',

    '&.md': {
      maxWidth: 40,
      maxHeight: 40,
    },
    '&.sm': {
      maxWidth: 15,
      maxHeight: 15,
    },
    '&.lg': {
      maxWidth: 80,
      maxHeight: 80,
    },
  },
  clickable: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  avatar: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,

    '&.md': {
      maxWidth: 40,
      maxHeight: 40,
    },
    '&.sm': {
      maxWidth: 15,
      maxHeight: 15,
    },
    '&.lg': {
      maxWidth: 80,
      maxHeight: 80,
    },
    '&.xl': {
      maxWidth: 160,
      maxHeight: 160,
    },
  },
  noAvatar: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,

    '&.md': {
      width: 40,
      height: 40,
    },
    '&.sm': {
      width: 15,
      height: 15,
    },
    '&.lg': {
      width: 80,
      height: 80,
    },
    '&.xl': {
      width: 160,
      height: 160,
    },
  },
  dark: {
    background: props => agnosticFunctor(props.background)(theme, {}) || theme.palette.neutralMedium,
    color: theme.palette.background,
    alignItems: 'center',
    placeContent: 'center',
  },
  light: {
    background: props => agnosticFunctor(props.background)(theme, {}) || theme.palette.background,
    color: theme.palette.neutralMedium,
    alignItems: 'center',
    placeContent: 'center',
  },
}));

interface AvatarProps {
  src?: string;
  className?: string;
  classes?: unknown;
  size?: 'md' | 'sm' | 'lg';
  theme?: 'light' | 'dark';
  name?: string;
  userId?: string;
}

const Avatar: FC<AvatarProps> = ({ size = 'md', classes = {}, className, src, theme = 'dark', name, userId }) => {
  const [isPopUpShown, setIsPopUpShown] = useState<boolean>(false);

  const styles = useAvatarStyles(classes);
  const [fallback, setFallback] = useState(false);

  return (
    <div
      className={clsx(styles.avatarWrapper, userId && styles.clickable, size, className)}
      onClick={() => userId && !isPopUpShown && setIsPopUpShown(true)}
    >
      {(!src || fallback) && (
        <div className={clsx(styles.noAvatar, styles[theme], size, className)}>
          <Typography variant="button" color="inherit">
            ?
          </Typography>
        </div>
      )}
      {src && !fallback && name && (
        <OverlayTrigger placement={'bottom'} overlay={<Tooltip id={'membersTooltip'}>{name}</Tooltip>}>
          <img
            className={clsx(styles.avatar, size, className)}
            src={src}
            alt="user"
            onError={() => setFallback(true)}
          />
        </OverlayTrigger>
      )}
      {src && !fallback && !name && (
        <img className={clsx(styles.avatar, size, className)} src={src} alt="user" onError={() => setFallback(true)} />
      )}
      {userId && isPopUpShown && <UserPopUp id={userId} onHide={() => setIsPopUpShown(false)} />}
    </div>
  );
};

export default Avatar;
