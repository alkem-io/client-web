import React, { FC, useEffect, useState } from 'react';
import Loading from './Loading/Loading';
import Typography from './Typography';

interface ThumbnailProps {
  file?: File;
  className?: string;
}

export const Thumbnail: FC<ThumbnailProps> = ({ file }) => {
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result?.toString());
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, [file]);
  if (loading) return <Loading text={''} />;

  if (file) return <img src={thumbnail} alt={file.name} className="img-thumbnail" height={200} width={200} />;
  return (
    <Typography variant="button" color="inherit">
      ?
    </Typography>
  );
};
export default Thumbnail;
