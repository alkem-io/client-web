import clsx from 'clsx';
import React, { forwardRef, useEffect, useState } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import UserPopUp from '../Community/UserPopUp';
import Image from './Image';
import Typography from './Typography';
import { Theme, Tooltip } from '@material-ui/core';

export const useAvatarStyles = createStyles<Theme, ClassProps>(theme => ({
  avatarWrapper: {
    display: 'flex',
    alignItems: 'center',
    placeContent: 'center',
    '&.md': {
      width: 40,
      height: 40,
    },
    '&.sm': {
      width: 15,
      hight: 15,
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
    background: props => agnosticFunctor(props?.background)(theme, {}) || theme.palette.neutralMedium.main,
    color: theme.palette.background.paper,
    alignItems: 'center',
    placeContent: 'center',
  },
  light: {
    background: props => agnosticFunctor(props?.background)(theme, {}) || theme.palette.background.paper,
    color: theme.palette.neutralMedium.main,
    alignItems: 'center',
    placeContent: 'center',
  },
}));

interface ClassProps {
  background?: string;
}

export interface AvatarProps {
  src?: string;
  className?: string;
  classes?: ClassProps;
  size?: 'md' | 'sm' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  name?: string;
  userId?: string;
}

const Avatar = forwardRef<unknown, AvatarProps>(
  ({ size = 'md', classes = {}, className, src, theme = 'dark', name, userId }, ref) => {
    const [isPopUpShown, setIsPopUpShown] = useState<boolean>(false);

    const styles = useAvatarStyles(classes);
    const [fallback, setFallback] = useState(false);
    useEffect(() => {
      // reset fallback when image source changes.
      setFallback(false);
    }, [src]);

    return (
      <div
        ref={ref as any}
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
          <Tooltip placement={'bottom'} id={'membersTooltip'} title={name}>
            <span>
              <Image
                className={clsx(styles.avatar, size, className)}
                src={src}
                alt="avatar"
                onError={() => setFallback(true)}
              />
            </span>
          </Tooltip>
        )}
        {src && !fallback && !name && (
          <Image
            className={clsx(styles.avatar, size, className)}
            src={src}
            alt="avatar"
            onError={() => setFallback(true)}
          />
        )}
        {userId && isPopUpShown && <UserPopUp id={userId} onHide={() => setIsPopUpShown(false)} />}
      </div>
    );
  }
);

export default Avatar;
