import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import App from '../ui/layout/topLevelWrappers/App';
import { CommunityContextProvider } from '../../domain/community/community/CommunityContext';
import { SpaceContextProvider } from '../../domain/journey/space/SpaceContext/SpaceContext';
import { OrganizationProvider } from '../../domain/community/contributor/organization/context/OrganizationProvider';
import HomePage from '../topLevelPages/Home/HomePage';
import AboutPage from '../topLevelPages/About';
import { Error404 } from '../../core/pages/Errors/Error404';
import ContributorsPage from '../../domain/community/user/ContributorsPage';
import { AdminRoute } from '../../domain/platform/admin/routing/AdminRoute';
import OrganizationRoute from '../../domain/community/contributor/organization/routing/OrganizationRoute';
import ProfileRoute from '../../domain/community/profile/routing/ProfileRoute';
import { Restricted } from '../../core/routing/Restricted';
import NoIdentityRedirect from '../../core/routing/NoIdentityRedirect';
import { SearchRoute } from '../search/searchRoute';
import { nameOfUrl } from './urlParams';
import UserRoute from '../../domain/community/user/routing/UserRoute';
import { SpaceRoute } from '../../domain/journey/space/routing/SpaceRoute';
import { ChallengeExplorerPage } from '../topLevelPages/TopLevelChallenges/ChallengeExplorerPage';
import { IdentityRoute } from '../../core/auth/authentication/routing/IdentityRoute';
import { ROUTE_HOME } from '../../domain/platform/routes/constants';
import { WithApmTransaction } from '../../domain/shared/components';
import devRoute from '../../dev/routes';
import RedirectToLanding from '../../domain/platform/routes/RedirectToLanding';
import ForumRoute from '../../domain/communication/discussion/routing/ForumRoute';
import InnovationLibraryPage from '../topLevelPages/InnovationLibraryPage/InnovationLibraryPage';
import InnovationPackRoute from '../../domain/collaboration/InnovationPack/InnovationPackRoute';
import { innovationPacksPath } from '../../domain/collaboration/InnovationPack/urlBuilders';
import NonIdentity from '../../domain/platform/routes/NonIdentity';
import useRedirectToIdentityDomain from '../../core/auth/authentication/routing/useRedirectToIdentityDomain';
import { NotFoundPageLayout } from '../../domain/journey/common/EntityPageLayout';

export const TopLevelRoutes: FC = () => {
  const { t } = useTranslation();

  const paths = useMemo(() => [{ value: '/', name: t('common.home'), real: true }], [t]);

  useRedirectToIdentityDomain();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WithApmTransaction path="/">
            <App />
          </WithApmTransaction>
        }
      >
        <Route index element={<RedirectToLanding />} />
        <Route
          path={ROUTE_HOME}
          element={
            <NonIdentity>
              <WithApmTransaction path="/home">
                <HomePage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`:${nameOfUrl.spaceNameId}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.spaceNameId}/*`}>
                <SpaceContextProvider>
                  <CommunityContextProvider>
                    <SpaceRoute paths={paths} />
                  </CommunityContextProvider>
                </SpaceContextProvider>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/admin/*"
          element={
            <NonIdentity>
              <WithApmTransaction path="/admin/*">
                <AdminRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/search"
          element={
            <NonIdentity>
              <WithApmTransaction path="/search">
                <SearchRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        {IdentityRoute()}
        <Route
          path={`/user/:${nameOfUrl.userNameId}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.userNameId}/*`}>
                <NoIdentityRedirect>
                  <UserRoute />
                </NoIdentityRedirect>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/innovation-library"
          element={
            <NonIdentity>
              <WithApmTransaction path="/innovation-library">
                <InnovationLibraryPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`${innovationPacksPath}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={innovationPacksPath}>
                <InnovationPackRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/challenges"
          element={
            <NonIdentity>
              <WithApmTransaction path="/challenges">
                <ChallengeExplorerPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/contributors"
          element={
            <NonIdentity>
              <WithApmTransaction path="/contributors">
                <ContributorsPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/forum/*"
          element={
            <NonIdentity>
              <WithApmTransaction path="/forum">
                <ForumRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/organization/:${nameOfUrl.organizationNameId}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/organization/:${nameOfUrl.organizationNameId}/*`}>
                <OrganizationProvider>
                  <OrganizationRoute />
                </OrganizationProvider>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/about"
          element={
            <NonIdentity>
              <WithApmTransaction path="/about">
                <AboutPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/profile"
          element={
            <NonIdentity>
              <WithApmTransaction path="/profile">
                <ProfileRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path="/restricted"
          element={
            <WithApmTransaction path="/restricted">
              <Restricted />
            </WithApmTransaction>
          }
        />
        <Route
          path="*"
          element={
            <WithApmTransaction path="*">
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            </WithApmTransaction>
          }
        />
        {devRoute()}
      </Route>
    </Routes>
  );
};
