import { ReactElement } from 'react';

type Rendered<Consumed extends {}> = (props: Consumed) => ReactElement | null;

export type ComponentOrChildrenFn<Provided extends {}> =
  | {
      component: Rendered<Provided>;
    }
  | {
      children: Rendered<Provided>;
    };

// @ts-ignore TS5UPGRADE
export type ContainerPropsWithProvided<TProps, TProvidedProps> = TProps & ComponentOrChildrenFn<TProvidedProps>;

export const renderComponentOrChildrenFn = <Consumed extends {}, Provided extends Consumed>(
  props: ComponentOrChildrenFn<Consumed>,
  provided: Provided
) => {
  if ('component' in props) {
    const Component = props.component;
    if ('key' in props && typeof props.key === 'string') {
      const key = props.key;
      return <Component key={key} {...provided} />;
    } else {
      return <Component {...provided} />;
    }
  }
  return props.children(provided);
};
