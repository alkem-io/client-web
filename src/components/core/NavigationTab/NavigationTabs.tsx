import React, { ReactNode, useMemo } from 'react';

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
  const url = '';
  const path = '';
  // const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const urlGetter = useMemo(() => createGetter(routes, url), [url]);
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

  // TODO return correct path
  return <>{children(result, '')}</>;
}

export default NavigationTabs;
