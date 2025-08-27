import { Avatar as MUIAvatar } from '@mui/material';
import useImageErrorHandler from '../image/useImageErrorHandler';
import { HTMLAttributes } from 'react';
import { CustomAvatarProps } from './Avatar';

const ErrorHandlingAvatar = ({
  onError,
  ref,
  src,
  ariaLabel,
  alt,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
} & CustomAvatarProps) => {
  const reportImageError = useImageErrorHandler();

  const handleError: React.ReactEventHandler<HTMLImageElement> = e => {
    reportImageError(src, e);
    onError?.(e);
  };

  return (
    <MUIAvatar
      ref={ref}
      src={src}
      aria-label={ariaLabel}
      slotProps={{ img: { alt: alt || '', onError: handleError } }}
      {...props}
    />
  );
};

export default ErrorHandlingAvatar;
