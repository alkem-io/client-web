import { Box, Grow } from '@mui/material';
import React from 'react';
import ContributorsSection from '../../Home/ContributorsSection';
import SpacesSection from '../../../../domain/journey/space/DashboardSpaces/SpacesSection';
import HomePageFooter from '../../Home/HomePageFooter';
import AnonymousUserHome from '../../Home/AnonymousUserHome';
import AuthenticatedUserHome from '../../Home/AuthenticatedUserHome';
import ReleaseUpdatesDialog from '../../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from '../../Home/HomePageLayout';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../../core/ui/grid/utils';
import { useQueryParams } from '../../../../core/routing/useQueryParams';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';

export const LegacyHomePage = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const params = useQueryParams();
  const isFromLanding = params.get('from') === 'landing';

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog />
      <PageContent>
        <PageContentColumn columns={12}>
          {!isFromLanding && (
            <Grow in={!isLoadingAuthentication} appear>
              <Box display="flex" flexDirection="column" gap={gutters()} flexGrow={1} maxWidth="100%">
                {isAuthenticated ? <AuthenticatedUserHome /> : <AnonymousUserHome />}
              </Box>
            </Grow>
          )}
          <SpacesSection />
          <ContributorsSection />
          <HomePageFooter />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default LegacyHomePage;
