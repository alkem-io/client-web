import React, { FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Admin } from './admin';
import { Ecoverses } from './ecoverse';
import { Community } from './community';
import { SignIn } from './signin';
import { Restricted } from './restricted';
import UserProfile from '../components/UserProfile/UserProfile';
import { FourOuFour } from '../pages';
import RestrictedRoute from './route.extensions';
/*local files imports end*/

const adminGroups = ['admin'];

export const Routing: FC = () => {
  return (
    <Switch>
      <RestrictedRoute path="/admin" allowedGroups={adminGroups} strict={false}>
        <Admin />
      </RestrictedRoute>
      <Route exact path="/">
        <Redirect to="/ecoverse/1" />
      </Route>
      <Route path="/ecoverse">
        <Ecoverses />
      </Route>
      <RestrictedRoute exact path="/community">
        <Community />
      </RestrictedRoute>
      <RestrictedRoute exact path="/profile">
        <UserProfile />
      </RestrictedRoute>
      <Route exact path="/signin">
        <SignIn />
      </Route>
      <Route exact path="/restricted">
        <Restricted />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
