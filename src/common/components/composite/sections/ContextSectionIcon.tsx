import React, { ComponentType, FC } from 'react';
import { Box, SvgIconProps } from '@mui/material';

interface ComponentProps extends SvgIconProps {}

interface ContextSectionIconProps {
  component: ComponentType<ComponentProps>;
}

const ContextSectionIcon: FC<ContextSectionIconProps> = ({ component: Component }) => {
  return (
    <Box color="grey.main" fontSize={48} display="flex">
      <Component fontSize="inherit" color="inherit" />
    </Box>
  );
};

export default ContextSectionIcon;
