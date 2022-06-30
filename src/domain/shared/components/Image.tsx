import React, { FC, useState } from 'react';
import Spinner from '../../../components/core/Spinner';

export const Image: FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = ({
  src,
  alt,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <Spinner />}
      <img
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className="image full"
        style={{ opacity: isLoaded ? 1 : 0, maxWidth: '100%', maxHeight: '100%' }}
        alt={alt}
        src={src}
        {...props}
      />
    </>
  );
};

export default Image;
