import React from 'react';
import Gutters from '../../grid/Gutters';
import { gutters } from '../../grid/utils';
import { alpha } from '@mui/material/styles';

export interface PageBannerCardWrapperProps {
  maxWidth?: string | number;
}

const PageBannerCardWrapper = (props: PageBannerCardWrapperProps) => {
  return (
    <Gutters
      gap={gutters(0.5)}
      sx={{
        backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
        borderRadius: theme => `${theme.shape.borderRadius}px`,
      }}
      {...props}
    />
  );
};

export default PageBannerCardWrapper;
