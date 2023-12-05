import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import MySpacesSection from '../../../domain/journey/space/MySpaces/MySpacesSection';
import { gutters } from '../../../core/ui/grid/utils';
import RecentForumMessages from '../myDashboard/recentForumMessages/RecentForumMessages';
import StartingSpace from '../myDashboard/startingSpace/StartingSpace';

const AuthenticatedUserHome = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
      <MySpacesSection />
      {/* TODO: This is not the final location for this block */}
      <RecentForumMessages />
      <StartingSpace />
    </Box>
  );
});

export default AuthenticatedUserHome;
