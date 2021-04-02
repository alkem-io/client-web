import React, { FC, useEffect, useRef, useState } from 'react';
import { Button, ImageProps, Image as BootstrapImage, Spinner } from 'react-bootstrap';

interface TestPageProps {}

export const TestPage: FC<TestPageProps> = () => {
  return (
    <Button>
      <input type="file" accept={'image/*'} />;
    </Button>
  );
};
export default TestPage;

// interface ImageProps extends Imag {
//   src: string;
//   height?: number | string;
//   width?: number | string;
//   alt?: string;
// }

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

export const Image: FC<ImageProps> = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <Spinner animation="grow" />}
      <BootstrapImage
        onLoad={() => {
          setIsLoaded(true);
        }}
        className="image full"
        style={{ opacity: isLoaded ? 1 : 0 }}
        alt={alt}
        src={src}
        {...props}
      />
    </>
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
