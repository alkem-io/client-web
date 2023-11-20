import React, { FC } from 'react';
import { Avatar as MUIAvatar, AvatarProps } from '@mui/material';
import useImageErrorHandler from '../image/useImageErrorHandler';

const Avatar: FC<AvatarProps> = ({ onError, ...props }) => {
  const reportImageError = useImageErrorHandler();

  const handleError = err => {
    reportImageError(props.src, err);
    onError?.(err);
  };

  return <MUIAvatar onError={handleError} {...props} />;
};

export default Avatar;
