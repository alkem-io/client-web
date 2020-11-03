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
  },
}));

interface AvatarProps {
  src?: string;
  classes?: string;
  size: 'default' | 'small';
}

const Avatar: FC<AvatarProps> = ({ size = 'default', classes }) => {
  const styles = useAvatarStyles();

  return <div className={clsx(styles.avatar, size, classes)} />;
};

export default Avatar;
