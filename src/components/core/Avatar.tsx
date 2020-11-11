import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import Typography from './Typography';

const useAvatarStyles = createStyles(theme => ({
  avatarWrapper: {
    display: 'flex',

    '&.default': {
      width: 40,
      height: 40,
    },
    '&.small': {
      width: 15,
      height: 15,
    },
    '&.big': {
      width: 80,
      height: 80,
    },
  },
  avatar: {
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
}

const Avatar: FC<AvatarProps> = ({ size = 'md', classes = {}, className, src, theme = 'dark' }) => {
  const styles = useAvatarStyles(classes);
  const [fallback, setFallback] = useState(false);

  return (
    <div className={clsx(styles.avatarWrapper, size, className)}>
      {(!src || fallback) && (
        <div className={clsx(styles.avatar, styles[theme], size, className)}>
          <Typography variant="button" color="inherit">
            ?
          </Typography>
        </div>
      )}
      {src && !fallback && (
        <img className={clsx(styles.avatar, size, className)} src={src} alt="user" onError={() => setFallback(true)} />
      )}
    </div>
  );
};

export default Avatar;
