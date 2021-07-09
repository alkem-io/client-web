import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { EditUserProfile, UserProfile } from '../components/UserProfile';
import { FourOuFour } from '../pages';
import { hideUserSegment, showUserSegment } from '../reducers/ui/userSegment/actions';
import RestrictedRoute from './route.extensions';

export const ProfileRoute: FC = () => {
  const { path } = useRouteMatch();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hideUserSegment());
    return () => {
      dispatch(showUserSegment());
    };
  }, []);

  return (
    <Switch>
      <RestrictedRoute exact path={`${path}/edit`}>
        <EditUserProfile />
      </RestrictedRoute>
      <RestrictedRoute exact path={`${path}`}>
        <UserProfile />
      </RestrictedRoute>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default ProfileRoute;
