import React from 'react';
import { Box, BoxProps } from '@mui/material';

const CardDetails = ({ transparent = false, sx, ...boxProps }: { transparent?: boolean } & BoxProps) => {
  const mergedSx = {
    backgroundColor: transparent ? undefined : 'background.default',
    // To disable margin collapsing because items inside, like CardTags have vertical margin.
    // (https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
    borderBottom: '1px solid transparent', // if another border > 0 is specified in sx, this should still work
    ...sx,
  };

  return <Box sx={mergedSx} {...boxProps} />;
};

export default CardDetails;
