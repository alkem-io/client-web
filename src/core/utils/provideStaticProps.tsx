import { ComponentType, forwardRef } from 'react';

interface Options {
  override?: boolean;
}

const provideStaticProps = <Props extends {}>(
  Component: ComponentType<Props>,
  staticProps: Partial<Props>,
  { override = false }: Options = {}
) => {
  return forwardRef<ComponentType<Props>, Props>((props, ref) => (
    <Component ref={ref} {...(override ? {} : staticProps)} {...props} {...(override ? staticProps : {})} />
  ));
};

export default provideStaticProps;
