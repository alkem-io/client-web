import { useMutation } from '@apollo/client';
import React, { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import { Button, Image as BootstrapImage, ImageProps, Spinner } from 'react-bootstrap';
import { UPLOAD_FILE_MUTATION } from '../graphql/upload';

interface TestPageProps {}

export const TestPage: FC<TestPageProps> = () => {
  const [uploadFile, { loading: saving }] = useMutation(UPLOAD_FILE_MUTATION);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    const valid = e?.target?.validity?.valid;
    if (valid) {
      uploadFile({
        variables: { file },
      });
    }

    // const files = Array.from(e.target.files);

    // if (files.length > 3) {
    //   const msg = 'Only 3 images can be uploaded at a time';
    //   return this.toast(msg, 'custom', 2000, toastColor);
    // }

    // const formData = new FormData();
    // const types = ['image/png', 'image/jpeg', 'image/gif'];

    // files.forEach((file, i) => {
    //   if (types.every(type => file.type !== type)) {
    //     errs.push(`'${file.type}' is not a supported format`);
    //   }

    //   if (file.size > 150000) {
    //     errs.push(`'${file.name}' is too large, please pick a smaller file`);
    //   }

    //   formData.append(i, file);
    // });

    // if (errs.length) {
    //   return errs.forEach(err => this.toast(err, 'custom', 2000, toastColor));
    // }

    // this.setState({ uploading: true });

    // fetch(`${API_URL}/image-upload`, {
    //   method: 'POST',
    //   body: formData,
    // })
    //   .then(res => {
    //     if (!res.ok) {
    //       throw res;
    //     }
    //     return res.json();
    //   })
    //   .then(images => {
    //     this.setState({
    //       uploading: false,
    //       images,
    //     });
    //   })
    //   .catch(err => {
    //     err.json().then(e => {
    //       this.toast(e.message, 'custom', 2000, toastColor);
    //       this.setState({ uploading: false });
    //     });
    //   });
  };
  if (saving) return <div>Uploading!</div>;
  return (
    <Button>
      <input type="file" accept={'image/*'} onChange={handleFile} />;
    </Button>
  );
  // return <FileInput />;
};

export const FileInput: FC = () => {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: FormEvent) => {
    e.preventDefault();
    if (ref && ref.current && ref.current.files) alert(`Selected file - ${ref.current.files[0].name}`);
  };

  return (
    <form onSubmit={handleFile}>
      <label>
        Upload file:
        <input type="file" ref={ref} />
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
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
