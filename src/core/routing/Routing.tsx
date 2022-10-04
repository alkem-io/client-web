import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import App from '../../common/components/composite/layout/App/App';
import { CommunityContextProvider } from '../../domain/community/community/CommunityContext';
import { HubContextProvider } from '../../domain/challenge/hub/HubContext/HubContext';
import { OrganizationProvider } from '../../domain/community/contributor/organization/context/OrganizationProvider';
import { AboutPage, Error404, HomePage } from '../../pages';
import ContributorsPage from '../../domain/community/contributor/ContributorsPage';
import { AdminRoute } from '../../domain/platform/admin/routing/AdminRoute';
import { MessagesRoute } from '../../domain/communication/messages/routing/MessagesRoute';
import OrganizationRoute from '../../domain/community/contributor/organization/routing/OrganizationRoute';
import ProfileRoute from '../../domain/community/profile/routing/ProfileRoute';
import { Restricted } from './Restricted';
import RestrictedRoute from './RestrictedRoute';
import { SearchRoute } from './search.route';
import { nameOfUrl } from './url-params';
import UserRoute from '../../domain/community/contributor/user/routing/UserRoute';
import { HubRoute } from '../../domain/challenge/hub/routing/HubRoute';
import HelpPage from '../help/pages/HelpPage';
import { ChallengeExplorerPage } from '../../domain/challenge/challenge/pages/ChallengeExplorerPage';
import { IdentityRoute } from '../auth/authentication/routing';
import { HELP_ROUTE, INSPIRATION_ROUTE } from '../../models/constants';
import InspirationPage from '../help/pages/InspirationPage';

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
        <Route path={HELP_ROUTE} element={<HelpPage />} />
        <Route path={INSPIRATION_ROUTE} element={<InspirationPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
