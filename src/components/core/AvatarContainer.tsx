import { Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { FC, Fragment } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import Typography from './Typography';

const useAvatarStyles = createStyles<Theme, ClassProps>(theme => ({
  container: {
    background: props => agnosticFunctor(props.background)(theme, {}) || theme.palette.background.paper,
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    flexGrow: 1,
    paddingBottom: theme.spacing(3),
    flexDirection: 'column',
  },
  avatarContainer: {
    display: 'flex',
    flexWrap: 'wrap',

    '& > *': {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
  avatar: {
    flexBasis: '100%',
    margin: 0,

    [theme.breakpoints.down('xl')]: {
      flexBasis: '0',
    },
  },
}));

interface ClassProps {
  background?: string;
}

interface AvatarContainerProps {
  className?: string;
  classes?: ClassProps;
  title?: string;
  itemsPerLine?: number;
  children: React.ReactNode[];
}

const AvatarContainer: FC<AvatarContainerProps> = ({ title, classes = {}, className, children, itemsPerLine = 10 }) => {
  const styles = useAvatarStyles(classes);

  return (
    <div className={clsx(styles.container, className)}>
      {title && (
        <Typography variant="caption" as="h4">
          {title}
        </Typography>
      )}
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
