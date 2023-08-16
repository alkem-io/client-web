import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import MySpacesSection from '../../../domain/journey/space/MySpaces/MySpacesSection';
import { UserContextValue } from '../../../domain/community/contributor/user/providers/UserProvider/UserProvider';
import { gutters } from '../../../core/ui/grid/utils';
import { PageTitle } from '../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

interface AuthenticatedUserHomeProps {
  user: UserContextValue;
}

const AuthenticatedUserHome = forwardRef<HTMLDivElement, AuthenticatedUserHomeProps>(({ user }, ref) => {
  const { t } = useTranslation();
  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
      <PageTitle>{t('pages.home.sections.welcome.welcome-back', { username: user.user?.user.firstName })}</PageTitle>
      <MySpacesSection userSpaceRoles={user.userSpaceRoles} loading={user.loading} />
    </Box>
  );
});

export default AuthenticatedUserHome;
