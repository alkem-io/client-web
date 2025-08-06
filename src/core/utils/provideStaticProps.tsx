import { ComponentType } from 'react';

interface Options {
  override?: boolean;
}

function provideStaticProps<P, R>(
  Component: ComponentType<P & { ref?: React.Ref<R> }>,
  staticProps: Partial<P>,
  { override = false }: Options = {}
) {
  return (props: P & { ref?: React.Ref<R> }) => (
    <Component {...(override ? {} : staticProps)} {...props} {...(override ? staticProps : {})} />
  );
}

export default provideStaticProps;
