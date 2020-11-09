import clsx from 'clsx';
import React, { FC, Fragment } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import Typography from './Typography';

const useAvatarStyles = createStyles(theme => ({
  container: {
    background: props => agnosticFunctor(props.background)(theme, {}) || theme.palette.background,
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    flexGrow: 1,
    paddingBottom: theme.shape.spacing(3),
    flexDirection: 'column',
  },
  avatarContainer: {
    display: 'flex',
    flexWrap: 'wrap',

    '& > *': {
      marginRight: theme.shape.spacing(1),
      marginBottom: theme.shape.spacing(1),
    },
  },
  avatar: {
    flexBasis: '100%',
    margin: 0,

    [theme.media.down('xl')]: {
      flexBasis: '0',
    },
  },
}));

interface AvatarContainerProps {
  className?: string;
  classes?: Record<string, unknown>;
  title: string;
  itemsPerLine?: number;
  children: React.ReactNode[];
}

const AvatarContainer: FC<AvatarContainerProps> = ({
  title = 'community members',
  classes = {},
  className,
  children,
  itemsPerLine = 10,
}) => {
  const styles = useAvatarStyles(classes);

  return (
    <div className={clsx(styles.container, className)}>
      <Typography variant="caption" as="h4">
        {title}
      </Typography>
      <div className={clsx(styles.avatarContainer)}>
        {children.map((x, i) =>
          i + 1 === itemsPerLine ? (
            <Fragment key={i}>
              {x}
              <div className={styles.avatar} />
            </Fragment>
          ) : (
            x
          )
        )}
      </div>
    </div>
  );
};

export default AvatarContainer;
