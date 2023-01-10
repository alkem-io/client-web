import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import MyHubsSection from '../../../challenge/hub/MyHubs/MyHubsSection';
import { UserContextValue } from '../../../community/contributor/user/providers/UserProvider/UserProvider';
import { gutters } from '../../../../core/ui/grid/utils';
import { PageTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

interface AuthenticatedUserHomeProps {
  user: UserContextValue;
}

const AuthenticatedUserHome = forwardRef<HTMLDivElement, AuthenticatedUserHomeProps>(({ user }, ref) => {
  const { t } = useTranslation();
  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
      <PageTitle>{t('pages.home.sections.welcome.welcome-back', { username: user.user?.user.firstName })}</PageTitle>
      <MyHubsSection userHubRoles={user.userHubRoles} loading={user.loading} username={user.user?.user.firstName} />
    </Box>
  );
});

export default AuthenticatedUserHome;
