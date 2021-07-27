import React, { FC, useEffect, useRef, useState } from 'react';
import { Image as BootstrapImage, ImageProps, Spinner } from 'react-bootstrap';
import { createStyles } from '../../hooks';

const useStyles = createStyles(theme => ({
  spinner: {
    color: theme.palette.primary,
  },
}));

export const Image: FC<ImageProps> = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const styles = useStyles();

  return (
    <>
      {!isLoaded && <Spinner animation="grow" className={styles.spinner} />}
      <BootstrapImage
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className="image full"
        style={{ opacity: isLoaded ? 1 : 0 }}
        alt={alt}
        src={src}
        {...props}
      />
    </>
  );
};
export default Image;

export const LazyImage: FC<ImageProps> = props => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useIntersectionObserver({
    target: ref,
    onIntersect: ([{ isIntersecting }], observerElement) => {
      if (isIntersecting) {
        setIsVisible(true);
        observerElement.unobserve(ref.current);
      }
    },
  });

  return (
    <div ref={ref} className={'image'}>
      {isVisible && <Image {...props} />}
    </div>
  );
};

const useIntersectionObserver = ({ target, onIntersect, threshold = 0.1, rootMargin = '0px' }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      rootMargin,
      threshold,
    });
    const current = target.current;
    observer.observe(current);
    return () => {
      observer.unobserve(current);
    };
  });
};
