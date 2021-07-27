import React, { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { createStyles } from '../../hooks';
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
  container: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
}));

export const Loading: FC<LoadingProps> = ({ text = 'Loading' }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Spinner animation="grow" className={styles.spinner} />
      <Typography variant="caption" color="primary" className={styles.text}>
        {text}
      </Typography>
    </div>
  );
};
export default Loading;
