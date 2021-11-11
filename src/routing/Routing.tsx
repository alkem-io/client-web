import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { EcoverseProvider } from '../context/EcoverseProvider';
import { OrganizationProvider } from '../context/OrganizationProvider';
import { CommunityProvider } from '../context/CommunityProvider';
import { AuthorizationCredential } from '../models/graphql-schema';
import { AboutPage, Error404, HomePage } from '../pages';
import { AdminRoute } from './admin/AdminRoute';
import { EcoverseRoute } from './ecoverse/EcoverseRoute';
import { IdentityRoute } from './identity/identity';
import { MessagesRoute } from './messages/MessagesRoute';
import OrganizationRoute from './organization/OrganizationRoute';
import ProfileRoute from './profile/ProfileRoute';
import { Restricted } from './Restricted';
import RestrictedRoute from './route.extensions';
import { SearchRoute } from './search.route';
import { nameOfUrl } from './url-params';
import { UserRoute } from './user/UserRoute';

export const Routing: FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
      <RestrictedRoute
        path="/admin"
        requiredCredentials={[
          AuthorizationCredential.GlobalAdmin,
          AuthorizationCredential.EcoverseAdmin,
          AuthorizationCredential.OrganizationAdmin,
          AuthorizationCredential.ChallengeAdmin,
          AuthorizationCredential.GlobalAdminCommunity,
          AuthorizationCredential.OrganizationOwner,
          AuthorizationCredential.OpportunityAdmin,
        ]}
        strict={false}
      >
        <AdminRoute />
      </RestrictedRoute>
      <Route path="/identity">
        <IdentityRoute />
      </Route>
      <RestrictedRoute path="/search">
        <SearchRoute />
      </RestrictedRoute>
      <RestrictedRoute path="/user">
        <UserRoute />
      </RestrictedRoute>
      <Route path={`/organization/:${nameOfUrl.organizationNameId}`}>
        <OrganizationProvider>
          <OrganizationRoute paths={[]} />
        </OrganizationProvider>
      </Route>
      <RestrictedRoute exact path="/messages">
        <MessagesRoute />
      </RestrictedRoute>
      <Route exact path="/about">
        <AboutPage />
      </Route>
      <Route exact path="/profile">
        <ProfileRoute />
      </Route>
      <Route exact path="/restricted">
        <Restricted />
      </Route>
      <Route exact path="/">
        <HomePage />
      </Route>
      <Route path={`/:${nameOfUrl.ecoverseNameId}`}>
        <EcoverseProvider>
          <CommunityProvider>
            <EcoverseRoute paths={[{ value: '/', name: t('common.ecoverses'), real: true }]} />
          </CommunityProvider>
        </EcoverseProvider>
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
