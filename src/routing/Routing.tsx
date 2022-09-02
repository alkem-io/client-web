import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import App from '../common/components/composite/layout/App/App';
import { CommunityContextProvider } from '../domain/community/CommunityContext';
import { HubContextProvider } from '../domain/hub/HubContext/HubContext';
import { OrganizationProvider } from '../domain/organization/context/OrganizationProvider';
import { AboutPage, Error404, HomePage } from '../pages';
import ContributorsPage from '../pages/Contributors/ContributorsPage';
import { AdminRoute } from '../domain/admin/routing/AdminRoute';
import { MessagesRoute } from './messages/MessagesRoute';
import OrganizationRoute from '../domain/organization/routing/OrganizationRoute';
import ProfileRoute from './profile/ProfileRoute';
import { Restricted } from './Restricted';
import RestrictedRoute from './RestrictedRoute';
import { SearchRoute } from './search.route';
import { nameOfUrl } from './url-params';
import UserRoute from '../domain/user/routing/UserRoute';
import { HubRoute } from '../domain/hub/routing/HubRoute';
import HelpPage from '../pages/Help/HelpPage';
import { ChallengeExplorerPage } from '../domain/challenge/pages/ChallengeExplorerPage';
import { IdentityRoute } from '../core/auth/authentication/routing';

export const Routing: FC = () => {
  const { t } = useTranslation();

  const paths = useMemo(() => [{ value: '/', name: t('common.home'), real: true }], []);

  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route
          path={`:${nameOfUrl.hubNameId}/*`}
          element={
            <HubContextProvider>
              <CommunityContextProvider>
                <HubRoute paths={paths} />
              </CommunityContextProvider>
            </HubContextProvider>
          }
        />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/search" element={<SearchRoute />} />
        <Route path="/identity/*" element={<IdentityRoute />} />
        <Route
          path={`/user/:${nameOfUrl.userNameId}/*`}
          element={
            <RestrictedRoute>
              <UserRoute />
            </RestrictedRoute>
          }
        />
        <Route path="/challenges" element={<ChallengeExplorerPage />} />
        <Route path="/contributors" element={<ContributorsPage />} />

        <Route
          path={`/organization/:${nameOfUrl.organizationNameId}/*`}
          element={
            <OrganizationProvider>
              <OrganizationRoute paths={[]} />
            </OrganizationProvider>
          }
        />
        <Route
          path="/messages"
          element={
            <RestrictedRoute>
              <MessagesRoute />
            </RestrictedRoute>
          }
        />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfileRoute />} />
        <Route path="/restricted" element={<Restricted />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
