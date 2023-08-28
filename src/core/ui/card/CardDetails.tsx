import React from 'react';
import { Box, BoxProps } from '@mui/material';

const CardDetails = ({ transparent = false, sx, ...boxProps }: { transparent?: boolean } & BoxProps) => {
  const mergedSx = {
    backgroundColor: transparent ? undefined : 'background.default',
    // To disable margin collapsing because items inside, like CardTags have vertical margin.
    // (https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
    overflow: 'hidden',
    ...sx,
  };

  return <Box sx={mergedSx} {...boxProps} />;
};

export default CardDetails;
