import { forwardRef } from 'react';
import { Avatar as MUIAvatar, AvatarProps } from '@mui/material';
import useImageErrorHandler from '../image/useImageErrorHandler';

const ErrorHandlingAvatar = forwardRef<HTMLDivElement, AvatarProps>(({ onError, ...props }, ref) => {
  const reportImageError = useImageErrorHandler();

  const handleError = err => {
    reportImageError(props.src, err);
    onError?.(err);
  };

  return <MUIAvatar ref={ref} onError={handleError} {...props} />;
});

export default ErrorHandlingAvatar;
