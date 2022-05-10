import clsx from 'clsx';
import React, { forwardRef, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { agnosticFunctor } from '../../utils/functor';
import UserPopUp from '../composite/dialogs/UserPopUp';
import Image from './Image';
import Typography from './Typography';
import { Theme, Tooltip } from '@mui/material';

type AvatarSizeName = 'md' | 'sm' | 'lg' | 'xl';

const AvatarSizes: Record<AvatarSizeName, number> = {
  md: 40,
  sm: 15,
  lg: 80,
  xl: 160,
};

const avatarSizeCSSRules = ['md', 'sm', 'lg', 'xl'].reduce(
  (rules, size) => ({
    ...rules,
    [`&.${size}`]: {
      width: AvatarSizes[size],
      height: AvatarSizes[size],
    },
  }),
  {} as Record<string, { width: number; height: number }>
);

export const useAvatarStyles = makeStyles<Theme, ClassProps>(theme => ({
  avatarWrapper: {
    display: 'flex',
    alignItems: 'center',
    placeContent: 'center',
    ...avatarSizeCSSRules,
  },
  clickable: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  avatar: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    ...avatarSizeCSSRules,
  },
  noAvatar: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    ...avatarSizeCSSRules,
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
  size?: AvatarSizeName;
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
