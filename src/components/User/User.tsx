import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';

const useUserStyles = createStyles(theme => ({
  flex: {
    display: 'flex',
    gap: `${theme.spacing(1)}px`,
    padding: theme.spacing(1),
    margin: -theme.spacing(1),

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
      marginLeft: theme.spacing(2),
    },
    '&.vertical': {
      marginLeft: theme.spacing(2),
      // marginTop: theme.spacing(0.5),
      // marginBottom: theme.spacing(0.5),
    },
    '&.horizontal.reversed': {
      marginLeft: 0,
      marginRight: theme.spacing(2),
    },
    '&.vertical.reversed': {
      marginLeft: 0,
      marginRight: theme.spacing(2),
      // marginTop: theme.spacing(0.5),
      // marginBottom: theme.spacing(0.5),
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
  onClick?: () => void;
  reverseLayout?: boolean;
}

const User = forwardRef<unknown, UserProps>(
  ({ orientation = 'vertical', name, title, src, reverseLayout = false, onClick }, ref) => {
    const styles = useUserStyles();

    const childrenClasses = clsx(styles.children, orientation, reverseLayout && 'reversed');
    const size = orientation === 'vertical' ? 'md' : 'sm';

    return (
      <div
        onClick={onClick}
        className={clsx(styles.flex, styles.center, styles.horizontal, reverseLayout && styles.reversedLayout)}
        style={{ cursor: 'pointer' }}
        // to="/profile"
      >
        <Avatar size={size} src={src} ref={ref as any} />
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
      </div>
    );
  }
);

export default User;
