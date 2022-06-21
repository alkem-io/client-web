import React, { FC } from 'react';
import { Box } from '@mui/material';

type SectionSpacerProps = {
  double?: boolean;
  half?: boolean;
};

const SectionSpacer: FC<SectionSpacerProps> = ({ double, half }) => {
  let size = 1;
  if (double) {
    size = 2;
  }
  if (half) {
    size = 0.5;
  }
  return <Box padding={size} />;
};

export default SectionSpacer;
