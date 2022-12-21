import { CircularProgress } from '@mui/material';
import React, { FC } from 'react';
import WrapperTypography from '../WrapperTypography';
import { useLoadingStyles } from './Loading.styles';

interface LoadingProps {
  text?: string;
}

export const Loading: FC<LoadingProps> = ({ text = 'Loading' }) => {
  const styles = useLoadingStyles();

  return (
    <div className={styles.container}>
      <CircularProgress className={styles.spinner} />
      <WrapperTypography variant="caption" color="primary" className={styles.text}>
        {text}
      </WrapperTypography>
    </div>
  );
};

export default Loading;
