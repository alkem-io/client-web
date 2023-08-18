import React, { ReactElement } from 'react';

type Rendered<Consumed extends {}> = (props: Consumed) => ReactElement | null;

export type ComponentOrChildrenFn<Provided extends {}> =
  | {
      component: Rendered<Provided>;
    }
  | {
      children: Rendered<Provided>;
    };

export type ContainerPropsWithProvided<TProps, TProvidedProps> = TProps & ComponentOrChildrenFn<TProvidedProps>;

export const renderComponentOrChildrenFn = <Consumed extends {}, Provided extends Consumed>(
  props: ComponentOrChildrenFn<Consumed>,
  provided: Provided
) => {
  if ('component' in props) {
    const Component = props.component;
    return <Component {...provided} />;
  }
  return props.children(provided);
};
