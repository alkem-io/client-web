import { Box, Grow } from '@mui/material';
import React from 'react';
import { useUserContext } from '../../../domain/community/user';
import ContributorsSection from './ContributorsSection';
import SpacesSection from '../../../domain/journey/space/DashboardSpaces/SpacesSection';
import HomePageFooter from './HomePageFooter';
import AnonymousUserHome from './AnonymousUserHome';
import AuthenticatedUserHome from './AuthenticatedUserHome';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from './HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../core/ui/grid/utils';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import { useInnovationHubQuery } from '../../../core/apollo/generated/apollo-hooks';
import InnovationHubHomePage from '../../../domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage';
import useInnovationHubAttrs from '../../../domain/innovationHub/InnovationHubHomePage/InnovationHubAttrs';
import Loading from '../../../core/ui/loading/Loading';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';

export const HomePage = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const user = useUserContext();

  const params = useQueryParams();
  const isFromLanding = params.get('from') === 'landing';

  const { data: innovationHubData, loading: innovationHubLoading } = useInnovationHubQuery();

  const innovationHub = useInnovationHubAttrs(innovationHubData?.platform.innovationHub);

  if (innovationHubLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  if (innovationHub) {
    return <InnovationHubHomePage innovationHub={innovationHub} />;
  }

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog />
      <PageContent>
        <PageContentColumn columns={12}>
          {!isFromLanding && (
            <Grow in={!isLoadingAuthentication} appear>
              <Box display="flex" flexDirection="column" gap={gutters()} flexGrow={1} maxWidth="100%">
                {isAuthenticated ? (
                  <AuthenticatedUserHome userName={user.user?.user.firstName} />
                ) : (
                  <AnonymousUserHome />
                )}
              </Box>
            </Grow>
          )}
          <SpacesSection userSpaceRoles={user.userSpaceRoles} loading={user.loading} />
          <ContributorsSection />
          <HomePageFooter />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default HomePage;
