import React, { ComponentType, ReactElement } from 'react';

export type ComponentOrChildrenFn<Provided> =
  | {
      component: ComponentType<Provided>;
    }
  | {
      children: (props: Provided) => ReactElement | null;
    };

export type ContainerPropsWithProvided<TProps, TProvidedProps> = TProps & ComponentOrChildrenFn<TProvidedProps>;

export const renderComponentOrChildrenFn = <Provided,>(props: ComponentOrChildrenFn<Provided>, provided: Provided) => {
  if ('component' in props) {
    const Component = props.component;
    return <Component {...provided} />;
  }
  return props.children(provided);
};
