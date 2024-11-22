import { forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';

const NavigationBarSideContent = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} position="absolute" top={0} left={0} right={0} {...props} />
));

export default NavigationBarSideContent;
