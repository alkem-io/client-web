import { Box, BoxProps } from '@mui/material';
import useImageErrorHandler from './useImageErrorHandler';

export type ImageProps = BoxProps<'img'>;

const Image = ({ onError, ...props }: ImageProps) => {
  const reportImageError = useImageErrorHandler();
  const { src } = props;

  if (!src) {
    return null;
  }

  const handleError = err => {
    reportImageError(src, err);
    onError?.(err);
  };

  return <Box component="img" onError={handleError} {...props} />;
};

export default Image;
