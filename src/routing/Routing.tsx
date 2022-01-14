import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import App from '../components/composite/layout/App/App';
import { CommunityProvider } from '../context/CommunityProvider';
import { EcoverseProvider } from '../context/EcoverseProvider';
import { OrganizationProvider } from '../context/OrganizationProvider';
import { AboutPage, Error404, HomePage } from '../pages';
import { ChallengeExplorerPage } from '../pages/Challenge/ChallengeExplorerPage';
import ContributorsPage from '../pages/Contributors/ContributorsPage';
import { AdminRoute } from './admin/AdminRoute';
import { EcoverseRoute } from './ecoverse/EcoverseRoute';
import { IdentityRoute } from './identity/identity';
import { MessagesRoute } from './messages/MessagesRoute';
import OrganizationRoute from './organization/OrganizationRoute';
import ProfileRoute from './profile/ProfileRoute';
import { Restricted } from './Restricted';
import RestrictedRoute from './RestrictedRoute';
import { SearchRoute } from './search.route';
import { nameOfUrl } from './url-params';
import UserRoute from './user/UserRoute';

export const Routing: FC = () => {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route
          path={`:${nameOfUrl.ecoverseNameId}/*`}
          element={
            <EcoverseProvider>
              <CommunityProvider>
                <EcoverseRoute paths={[{ value: '/', name: t('common.home'), real: true }]} />
              </CommunityProvider>
            </EcoverseProvider>
          }
        ></Route>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/search" element={<SearchRoute />}></Route>
        <Route path="/identity/*" element={<IdentityRoute />} />
        <Route
          path={`/user/:${nameOfUrl.userId}`}
          element={
            <RestrictedRoute>
              <UserRoute />
            </RestrictedRoute>
          }
        ></Route>
        <Route path="/challenges" element={<ChallengeExplorerPage />} />
        <Route path="/contributors" element={<ContributorsPage />} />

        <Route
          path={`/organization/:${nameOfUrl.organizationNameId}`}
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
        <Route path="/restricted" element={<Restricted />}></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
