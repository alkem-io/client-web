import { Box, Grow } from '@mui/material';
import React from 'react';
import ContributorsSection from '../../Home/ContributorsSection';
import ExploreOtherChallenges from '../exploreOtherChallenges/ExploreOtherChallenges';
import AnonymousUserHome from '../../Home/AnonymousUserHome';
import AuthenticatedUserHome from '../../Home/AuthenticatedUserHome';
import ReleaseUpdatesDialog from '../../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from '../../Home/HomePageLayout';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../../core/ui/grid/utils';
import { useQueryParams } from '../../../../core/routing/useQueryParams';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import MoreAboutAlkemio from '../moreAboutAlkemio/MoreAboutAlkemio';
import useReleaseNotes from '../../../../domain/platform/metadata/useReleaseNotes';

export const LegacyHomePage = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const params = useQueryParams();
  const isFromLanding = params.get('from') === 'landing';

  const releaseNotes = useReleaseNotes();

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog {...releaseNotes} />
      <PageContent>
        <PageContentColumn columns={12}>
          {!isFromLanding && (
            <Grow in={!isLoadingAuthentication} appear>
              <Box display="flex" flexDirection="column" gap={gutters()} flexGrow={1} maxWidth="100%">
                {isAuthenticated ? <AuthenticatedUserHome /> : <AnonymousUserHome />}
              </Box>
            </Grow>
          )}
          <ExploreOtherChallenges />
          <ContributorsSection />
          <MoreAboutAlkemio />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default LegacyHomePage;
