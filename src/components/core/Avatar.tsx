import clsx from 'clsx';
import React, { forwardRef, ReactNode, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { agnosticFunctor } from '../../utils/functor';
import UserPopUp from '../composite/dialogs/UserPopUp';
import Image from './Image';
import Typography from './Typography';
import { Theme, Tooltip } from '@mui/material';

type AvatarSizeName = 'md' | 'sm' | 'lg' | 'xl' | 'md2';

const AvatarSizes: Record<AvatarSizeName, number> = {
  md: 40,
  sm: 15,
  md2: 64,
  lg: 80,
  xl: 160,
};

const avatarSizeCSSRules = ['md', 'sm', 'lg', 'xl', 'md2'].reduce(
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

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', classes = {}, className, src, theme = 'dark', name, userId }, ref) => {
    const [isPopUpShown, setIsPopUpShown] = useState<boolean>(false);

    const styles = useAvatarStyles(classes);
    const [hasFailedToLoad, setHasFailedToLoad] = useState(false);

    useEffect(() => {
      setHasFailedToLoad(false);
    }, [src]);

    const isEmpty = !src || hasFailedToLoad;

    const optionallyWrapInTooltip = (image: ReactNode) => {
      if (!name) {
        return image;
      }

      return (
        <Tooltip placement={'bottom'} id={'membersTooltip'} title={name}>
          <span>{image}</span>
        </Tooltip>
      );
    };

    return (
      <div
        ref={ref}
        className={clsx(styles.avatarWrapper, userId && styles.clickable, size, className)}
        onClick={() => userId && !isPopUpShown && setIsPopUpShown(true)}
      >
        {isEmpty && (
          <div className={clsx(styles.noAvatar, styles[theme], size, className)}>
            <Typography variant="button" color="inherit">
              ?
            </Typography>
          </div>
        )}
        {!isEmpty &&
          optionallyWrapInTooltip(
            <Image
              className={clsx(styles.avatar, size, className)}
              src={src}
              alt="avatar"
              onError={() => setHasFailedToLoad(true)}
            />
          )}
        {userId && isPopUpShown && <UserPopUp id={userId} onHide={() => setIsPopUpShown(false)} />}
      </div>
    );
  }
);

export default Avatar;
