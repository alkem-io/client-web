import React, { FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Admin } from './admin';
import { Ecoverse } from './ecoverse';
import { Community } from './community';
import UserProfile from '../components/UserProfile/UserProfile';
import { FourOuFour } from '../pages';
/*local files imports end*/

export const Routing: FC = () => {
  return (
    <Switch>
      <Route path="/admin">
        <Admin />
      </Route>
      <Route exact path="/">
        <Redirect to="/ecoverse/1" />
      </Route>
      <Route path="/ecoverse">
        <Ecoverse />
      </Route>
      <Route exact path="/community">
        <Community />
      </Route>
      <Route exact path="/profile">
        <UserProfile />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
