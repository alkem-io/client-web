import { Typography } from '@mui/material';
import React, { FC } from 'react';

interface SectionSubHeaderProps {
  text: string;
}

const SectionSubHeader: FC<SectionSubHeaderProps> = ({ text }) => {
  return (
    <Typography
      variant="h5"
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    />
  );
};

export default SectionSubHeader;
