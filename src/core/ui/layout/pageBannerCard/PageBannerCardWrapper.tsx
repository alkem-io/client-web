import React from 'react';
import Gutters, { GuttersProps } from '../../grid/Gutters';
import { gutters } from '../../grid/utils';
import { alpha } from '@mui/material/styles';
import { BoxProps } from '@mui/material';

export interface PageBannerCardWrapperProps extends GuttersProps {
  maxWidth?: string | number;
}

const PageBannerCardWrapper = (props: PageBannerCardWrapperProps & BoxProps) => {
  return (
    <Gutters
      gap={gutters(0.5)}
      sx={{
        backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
        borderRadius: theme => `${theme.shape.borderRadius}px`,
        backdropFilter: 'blur(10px)',
      }}
      {...props}
    />
  );
};

export default PageBannerCardWrapper;
