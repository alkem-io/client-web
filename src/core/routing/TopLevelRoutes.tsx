import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import App from '../../common/components/composite/layout/App/App';
import { CommunityContextProvider } from '../../domain/community/community/CommunityContext';
import { HubContextProvider } from '../../domain/challenge/hub/HubContext/HubContext';
import { OrganizationProvider } from '../../domain/community/contributor/organization/context/OrganizationProvider';
import HomePage from '../../domain/platform/pages/Home/HomePage';
import AboutPage from '../../domain/platform/pages/About';
import { Error404 } from '../pages/Errors/Error404';
import ContributorsPage from '../../domain/community/contributor/ContributorsPage';
import { AdminRoute } from '../../domain/platform/admin/routing/AdminRoute';
import { MessagesRoute } from '../../domain/communication/messages/routing/MessagesRoute';
import OrganizationRoute from '../../domain/community/contributor/organization/routing/OrganizationRoute';
import ProfileRoute from '../../domain/community/profile/routing/ProfileRoute';
import { Restricted } from './Restricted';
import RestrictedRoute from './RestrictedRoute';
import { SearchRoute } from './search.route';
import { nameOfUrl } from './urlParams';
import UserRoute from '../../domain/community/contributor/user/routing/UserRoute';
import { HubRoute } from '../../domain/challenge/hub/routing/HubRoute';
import { ChallengeExplorerPage } from '../../domain/challenge/challenge/pages/ChallengeExplorerPage';
import { IdentityRoute } from '../auth/authentication/routing';
import { INSPIRATION_ROUTE } from './route.constants';
import InspirationPage from '../help/pages/InspirationPage';
import { WithApmTransaction } from '../../domain/shared/components';
import devRoute from '../../dev/routes';

export const TopLevelRoutes: FC = () => {
  const { t } = useTranslation();

  const paths = useMemo(() => [{ value: '/', name: t('common.home'), real: true }], [t]);

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
        <Route
          index
          element={
            <WithApmTransaction path="/">
              <HomePage />
            </WithApmTransaction>
          }
        />
        <Route
          path={`:${nameOfUrl.hubNameId}/*`}
          element={
            <WithApmTransaction path={`:${nameOfUrl.hubNameId}/*`}>
              <HubContextProvider>
                <CommunityContextProvider>
                  <HubRoute paths={paths} />
                </CommunityContextProvider>
              </HubContextProvider>
            </WithApmTransaction>
          }
        />
        <Route
          path="/admin/*"
          element={
            <WithApmTransaction path="/admin/*">
              <AdminRoute />
            </WithApmTransaction>
          }
        />
        <Route
          path="/search"
          element={
            <WithApmTransaction path="/search">
              <SearchRoute />
            </WithApmTransaction>
          }
        />
        <Route
          path="/identity/*"
          element={
            <WithApmTransaction path="/identity/*">
              <IdentityRoute />
            </WithApmTransaction>
          }
        />
        <Route
          path={`/user/:${nameOfUrl.userNameId}/*`}
          element={
            <WithApmTransaction path={`:${nameOfUrl.userNameId}/*`}>
              <RestrictedRoute>
                <UserRoute />
              </RestrictedRoute>
            </WithApmTransaction>
          }
        />
        <Route
          path="/challenges"
          element={
            <WithApmTransaction path="/challenges">
              <ChallengeExplorerPage />
            </WithApmTransaction>
          }
        />
        <Route
          path="/contributors"
          element={
            <WithApmTransaction path="/contributors">
              <ContributorsPage />
            </WithApmTransaction>
          }
        />

        <Route
          path={`/organization/:${nameOfUrl.organizationNameId}/*`}
          element={
            <WithApmTransaction path={`/organization/:${nameOfUrl.organizationNameId}/*`}>
              <OrganizationProvider>
                <OrganizationRoute paths={[]} />
              </OrganizationProvider>
            </WithApmTransaction>
          }
        />
        <Route
          path="/messages"
          element={
            <WithApmTransaction path="/messages">
              <RestrictedRoute>
                <MessagesRoute />
              </RestrictedRoute>
            </WithApmTransaction>
          }
        />

        <Route
          path="/about"
          element={
            <WithApmTransaction path="/about">
              <AboutPage />
            </WithApmTransaction>
          }
        />
        <Route
          path="/profile"
          element={
            <WithApmTransaction path="/profile">
              <ProfileRoute />
            </WithApmTransaction>
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
          path={INSPIRATION_ROUTE}
          element={
            <WithApmTransaction path={INSPIRATION_ROUTE}>
              <InspirationPage />
            </WithApmTransaction>
          }
        />
        <Route
          path="*"
          element={
            <WithApmTransaction path="*">
              <Error404 />
            </WithApmTransaction>
          }
        />
        {devRoute()}
      </Route>
    </Routes>
  );
};
