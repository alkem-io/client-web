import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';

const useAvatarStyles = createStyles(theme => ({
  avatar: {
    background: theme.palette.neutralMedium,
    display: 'flex',
    borderRadius: theme.shape.borderRadius,

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
}));

interface AvatarProps {
  src?: string;
  className?: string;
  classes?: unknown;
  size: 'default' | 'small' | 'big';
}

const Avatar: FC<AvatarProps> = ({ size = 'default', classes, className }) => {
  const styles = useAvatarStyles(classes);

  return <div className={clsx(styles.avatar, size, className)} />;
};

export default Avatar;
