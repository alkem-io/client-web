import { Avatar as MUIAvatar, AvatarProps } from '@mui/material';
import useImageErrorHandler from '../image/useImageErrorHandler';
import { HTMLAttributes } from 'react';
import { CustomAvatarProps } from './Avatar';

const ErrorHandlingAvatar = ({
  onError,
  ref,
  src,
  ariaLabel,
  alt,
}: AvatarProps &
  HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  } & CustomAvatarProps) => {
  const reportImageError = useImageErrorHandler();

  const handleError = err => {
    reportImageError(src, err);
    onError?.(err);
  };

  return <MUIAvatar onError={handleError} src={src} aria-label={ariaLabel} alt={alt} ref={ref} />;
};

export default ErrorHandlingAvatar;
