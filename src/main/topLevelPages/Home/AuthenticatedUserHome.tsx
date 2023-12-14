import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import MySpacesSection from '../../../domain/journey/space/MySpaces/MySpacesSection';
import { gutters } from '../../../core/ui/grid/utils';

/**
 * @deprecated
 * TODO remove this component
 */
const AuthenticatedUserHome = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
      <MySpacesSection />
    </Box>
  );
});

export default AuthenticatedUserHome;
