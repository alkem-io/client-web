import React, { useMemo } from 'react';
import { IndexRouteProps, LayoutRouteProps, PathRouteProps, Route, RouteProps } from 'react-router-dom';
import { withTransaction } from '@elastic/apm-rum-react';

export const RouteWithApm = ({
  element,
  ...rest
}: PathRouteProps | LayoutRouteProps | IndexRouteProps): ReturnType<typeof Route> => {
  const path = (rest as RouteProps | PathRouteProps)?.path ?? 'index';
  const apmComponent = useMemo(() => withTransaction(
    path,
    'route-change',
    (transaction, props) => {
      if (transaction) {
        const name = getTransactionName(path, props);
        name && (transaction.name = name)
      }
    })(element),
    [path]
  );

  return <Route element={apmComponent} {...rest} />
};

function getTransactionName(name: string, props: any) {
  const { match = {} } = props;

  if (Array.isArray(name) && match.path) {
    return match.path
  }
  return name
}