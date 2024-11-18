import { BoxProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';

import { gutters } from '@/core/ui/grid/utils';

export interface PageBannerCardWrapperProps extends GuttersProps, BoxProps {
  maxWidth?: string | number;
}

const PageBannerCardWrapper = (props: PageBannerCardWrapperProps) => (
  <Gutters
    {...props}
    gap={gutters(0.5)}
    sx={{
      backdropFilter: 'blur(10px)',
      borderRadius: theme => `${theme.shape.borderRadius}px`,
      backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
    }}
  />
);

export default PageBannerCardWrapper;
