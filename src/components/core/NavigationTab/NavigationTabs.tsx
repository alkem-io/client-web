import React, { ReactNode, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';

const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

type Result<T> = Record<keyof T, { to: string; value: string }>;

export interface NavigationTabsProps<T> {
  routes: T;
  children: (routes: Result<T>, value?: string) => ReactNode;
}

function NavigationTabs<T>({ routes, children }: NavigationTabsProps<T>): React.ReactElement {
  const { path, url } = useRouteMatch();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const urlGetter = useMemo(() => createGetter(routes, url), [url]);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  console.log(path);

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

  return <>{children(result, match?.path)}</>;
}

export default NavigationTabs;
