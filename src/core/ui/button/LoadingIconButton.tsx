import { FC } from 'react';
import { CircularProgress, IconButton, IconButtonProps } from '@mui/material';

const LoadingIconButton: FC<IconButtonProps & { loading?: boolean }> = ({ loading, ...props }) => {
  return loading ? <CircularProgress /> : <IconButton {...props} />;
};

export default LoadingIconButton;
