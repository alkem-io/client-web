import clsx from 'clsx';
import React, { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

interface LoadingProps {
  text?: string;
}

const useStyles = createStyles(theme => ({
  spinner: {
    color: theme.palette.primary,
  },
  text: {
    marginLeft: theme.shape.spacing(2),
  },
  itemsContentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const Loading: FC<LoadingProps> = ({ text = 'Loading' }) => {
  const styles = useStyles();

  return (
    <div className={clsx('d-flex', 'flex-grow-1', styles.itemsContentCenter)}>
      <Spinner animation="grow" className={styles.spinner} />
      <Typography variant="caption" color="primary" className={styles.text}>
        {text}
      </Typography>
    </div>
  );
};
export default Loading;
