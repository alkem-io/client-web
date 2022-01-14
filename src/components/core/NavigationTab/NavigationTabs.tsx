import React, { ReactNode, useMemo } from 'react';
import { useResolvedPath } from 'react-router-dom';
import useRouteMatch from '../../../hooks/routing/useRouteMatch';

const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

type Result<T> = Record<keyof T, { to: string; value: string }>;

export interface NavigationTabsProps<T extends Record<string, string>> {
  routes: T;
  children: (routes: Result<T>, selectedTab?: string) => ReactNode;
}

function NavigationTabs<T extends Record<string, string>>({
  routes,
  children,
}: NavigationTabsProps<T>): React.ReactElement {
  const { pathname: path } = useResolvedPath('./');

  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const urlGetter = useMemo(() => createGetter(routes, ''), []);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);

  const result = useMemo(
    () =>
      (Object.keys(routes) as Array<keyof T>).reduce<Result<T>>((acc, curr) => {
        acc[curr] = {
          to: urlGetter(curr),
          value: pathGetter(curr),
        };
        return acc;
      }, {} as Result<T>),
    [routes]
  );

  return <>{children(result, match?.pathname)}</>;
}

export default NavigationTabs;
