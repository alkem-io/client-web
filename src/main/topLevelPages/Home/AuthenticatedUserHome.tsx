import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import MySpacesSection from '../../../domain/journey/space/MySpaces/MySpacesSection';
import { gutters } from '../../../core/ui/grid/utils';
import { PageTitle } from '../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

interface AuthenticatedUserHomeProps {
  userName: string | undefined;
}

const AuthenticatedUserHome = forwardRef<HTMLDivElement, AuthenticatedUserHomeProps>(({ userName }, ref) => {
  const { t } = useTranslation();
  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
      <PageTitle>{t('pages.home.sections.welcome.welcome-back', { username: userName })}</PageTitle>
      <MySpacesSection />
    </Box>
  );
});

export default AuthenticatedUserHome;
