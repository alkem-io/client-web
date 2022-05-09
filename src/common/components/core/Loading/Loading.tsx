import { CircularProgress } from '@mui/material';
import React, { FC } from 'react';
import Typography from '../Typography';
import { useLoadingStyles } from './Loading.styles';

interface LoadingProps {
  text?: string;
}

export const Loading: FC<LoadingProps> = ({ text = 'Loading' }) => {
  const styles = useLoadingStyles();

  return (
    <div className={styles.container}>
      <CircularProgress className={styles.spinner} />
      <Typography variant="caption" color="primary" className={styles.text}>
        {text}
      </Typography>
    </div>
  );
};
export default Loading;
