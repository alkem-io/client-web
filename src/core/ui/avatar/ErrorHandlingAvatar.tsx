import { Avatar as MUIAvatar, AvatarProps } from '@mui/material';
import useImageErrorHandler from '../image/useImageErrorHandler';
import { HTMLAttributes } from 'react';

const ErrorHandlingAvatar = ({
  onError,
  ref,
  ...props
}: AvatarProps &
  HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => {
  const reportImageError = useImageErrorHandler();

  const handleError = err => {
    reportImageError(props.src, err);
    onError?.(err);
  };

  return <MUIAvatar onError={handleError} {...props} ref={ref} role="img" />;
};

export default ErrorHandlingAvatar;
