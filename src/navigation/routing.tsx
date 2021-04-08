import React, { FC } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { FourOuFour } from '../pages';
import AboutPage from '../pages/About';
import { Admin } from './admin/admin';
import { Community } from './community';
import { Ecoverses } from './ecoverse';
import LoginRoute from './login';
import LogoutRoute from './logout';
import { Messages } from './messages';
import ProfileRoute from './profile';
import { RegisterRoute } from './register';
import { Restricted } from './restricted';
import RestrictedRoute, { AuthenticatedRoute } from './route.extensions';
import WelcomeRoute from './welcome';
/*local files imports end*/

const adminGroups = ['admin'];

export const Routing: FC = () => {
  const { pathname } = useLocation();

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
      <RestrictedRoute path="/admin" allowedGroups={adminGroups} strict={false}>
        <Admin />
      </RestrictedRoute>
      <Route exact path="/login">
        <LoginRoute />
      </Route>
      <Route exact path="/logout">
        <LogoutRoute />
      </Route>
      <Route exact path="/welcome">
        <WelcomeRoute />
      </Route>
      <Route exact path="/register">
        <RegisterRoute />
      </Route>
      <RestrictedRoute path="/community">
        <Community />
      </RestrictedRoute>
      <RestrictedRoute exact path="/messages">
        <Messages />
      </RestrictedRoute>
      <RestrictedRoute path="/profile">
        <ProfileRoute />
      </RestrictedRoute>
      <Route exact path="/about">
        <AboutPage />
      </Route>
      <Route exact path="/restricted">
        <Restricted />
      </Route>
      <AuthenticatedRoute path="/">
        <Ecoverses />
      </AuthenticatedRoute>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
