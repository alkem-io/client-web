import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { community } from '../components/core/Typography.dummy.json';
import { Community as CommunityPage, FourOuFour } from '../pages';

interface RestrictedParams {
  origin?: string;
}

export const Restricted: FC = () => {
  const { origin } = useParams<RestrictedParams>();
  return <div>You tried to access {origin}Restricted</div>;
};
