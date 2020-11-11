import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from '../core/Typography';
import Avatar from '../core/Avatar';
import { Link } from 'react-router-dom';

const useUserStyles = createStyles(theme => ({
  flex: {
    display: 'flex',
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
      marginTop: theme.shape.spacing(0.5),
      marginBottom: theme.shape.spacing(0.5),
    },
  },
}));

interface UserProps {
  orientation: 'horizontal' | 'vertical';
  name: string;
  title: string;
  src: string | undefined;
}

const User: FC<UserProps> = ({ orientation = 'vertical', name, title, src }) => {
  const styles = useUserStyles();

  const childrenClasses = clsx(styles.children, orientation);

  return (
    <Link className={clsx(styles.flex, styles.center, styles.horizontal)} to="/profile">
      <Avatar size={orientation === 'vertical' ? 'md' : 'sm'} src={src} />
      <div className={clsx(styles.flex, styles[orientation])}>
        <Typography variant="caption" color="neutral" weight="bold" className={childrenClasses}>
          {name}
        </Typography>
        <Typography variant="caption" color="neutralMedium" weight="medium" className={childrenClasses}>
          {title}
        </Typography>
      </div>
    </Link>
  );
};

export default User;
