import { Box, Grow } from '@mui/material';
import React from 'react';
import { useUserContext } from '../../../community/contributor/user';
import ContributorsSection from './ContributorsSection';
import SpacesSection from '../../../challenge/space/DashboardSpaces/SpacesSection';
import WelcomeSection from './WelcomeSection';
import HomePageFooter from './HomePageFooter';
import AnonymousUserHome from './AnonymousUserHome';
import AuthenticatedUserHome from './AuthenticatedUserHome';
import PlatformUpdates from '../../notifications/ReleaseUpdates/ReleaseUpdatesNotification';
import HomePageLayout from './HomePageLayout';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../../core/ui/grid/utils';
import { useQueryParams } from '../../../../core/routing/useQueryParams';
import { useInnovationHubQuery } from '../../../../core/apollo/generated/apollo-hooks';
import InnovationHubHomePage from '../../InnovationHub/InnovationHubHomePage/InnovationHubHomePage';
import useInnovationHubAttrs from '../../InnovationHub/InnovationHubHomePage/InnovationHubAttrs';
import { Loading } from '../../../../common/components/core';

export const HomePage = () => {
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
      <WelcomeSection />
      {!isFromLanding && <PlatformUpdates />}
      <PageContent>
        <PageContentColumn columns={12}>
          {!isFromLanding && (
            <Grow in={!user.loading} appear>
              <Box display="flex" flexDirection="column" gap={gutters()} flexGrow={1} maxWidth="100%">
                {user.isAuthenticated ? <AuthenticatedUserHome user={user} /> : <AnonymousUserHome />}
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
