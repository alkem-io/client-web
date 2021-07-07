import clsx from 'clsx';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { createStyles } from '../../hooks/useTheme';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';

const useUserStyles = createStyles(theme => ({
  flex: {
    display: 'flex',
    gap: `${theme.shape.spacing(1)}px`,
    padding: theme.shape.spacing(1),
    margin: -theme.shape.spacing(1),

    '&:hover': {
      textDecoration: 'none',
    },
  },
  center: {
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  children: {
    // flex: '1 1 auto',

    '&.horizontal': {
      marginLeft: theme.shape.spacing(2),
    },
    '&.vertical': {
      marginLeft: theme.shape.spacing(2),
      // marginTop: theme.shape.spacing(0.5),
      // marginBottom: theme.shape.spacing(0.5),
    },
    '&.horizontal.reversed': {
      marginLeft: 0,
      marginRight: theme.shape.spacing(2),
    },
    '&.vertical.reversed': {
      marginLeft: 0,
      marginRight: theme.shape.spacing(2),
      // marginTop: theme.shape.spacing(0.5),
      // marginBottom: theme.shape.spacing(0.5),
    },
  },
  reversedLayout: {
    flexDirection: 'row-reverse',
  },
}));

interface UserProps {
  orientation: 'horizontal' | 'vertical';
  name: string;
  title: string;
  src: string | undefined;
  reverseLayout?: boolean;
}

const User: FC<UserProps> = ({ orientation = 'vertical', name, title, src, reverseLayout = false }) => {
  const styles = useUserStyles();

  const childrenClasses = clsx(styles.children, orientation, reverseLayout && 'reversed');
  const size = orientation === 'vertical' ? 'md' : 'sm';

  return (
    <Link
      className={clsx(styles.flex, styles.center, styles.horizontal, reverseLayout && styles.reversedLayout)}
      to="/profile"
    >
      <Avatar size={size} src={src} />
      <div
        className={clsx(
          styles.flex,
          styles[orientation],
          orientation === 'horizontal' && reverseLayout && styles.reversedLayout
        )}
      >
        <Typography variant="caption" color="neutral" weight="bold" className={childrenClasses}>
          {name}
        </Typography>
        <Typography variant="caption" color="neutralMedium" weight="medium" className={childrenClasses}>
          {title}
        </Typography>
      </div>
      {/* <UserRoles /> */}
    </Link>
  );
};

export default User;
