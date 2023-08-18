import { Theme } from '@mui/material/styles';
import clsx from 'clsx';
import React, { FC, Fragment } from 'react';
import { makeStyles } from '@mui/styles';
import WrapperTypography from '../../../../../core/ui/typography/deprecated/WrapperTypography';

const useAvatarStyles = makeStyles<Theme, ClassProps>(theme => ({
  container: {
    background: props => props.background ?? theme.palette.background.default,
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

const GroupMembersDetailsAvatarContainer: FC<AvatarContainerProps> = ({
  title,
  classes = {},
  className,
  children,
  itemsPerLine = 10,
}) => {
  const styles = useAvatarStyles(classes);

  return (
    <div className={clsx(styles.container, className)}>
      {title && (
        <WrapperTypography variant="caption" as="h4">
          {title}
        </WrapperTypography>
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

export default GroupMembersDetailsAvatarContainer;
