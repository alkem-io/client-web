import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import MyHubsSection from '../../../challenge/hub/MyHubs/MyHubsSection';
import { UserContextValue } from '../../../community/contributor/user/providers/UserProvider/UserProvider';
import { gutters } from '../../../../core/ui/grid/utils';

interface AuthenticatedUserHomeProps {
  user: UserContextValue;
}

const AuthenticatedUserHome = forwardRef<HTMLDivElement, AuthenticatedUserHomeProps>(({ user }, ref) => {
  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
      <MyHubsSection userHubRoles={user.userHubRoles} loading={user.loading} username={user.user?.user.firstName} />
    </Box>
  );
});

export default AuthenticatedUserHome;
