import { ComponentType, forwardRef, ForwardedRef } from 'react';

interface Options {
  override?: boolean;
}

const provideStaticProps = <Props extends {}>(
  Component: ComponentType<Props>,
  staticProps: Partial<Props>,
  { override = false }: Options = {}
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return forwardRef<Props, Props>((props, ref: ForwardedRef<any>) => (
    // @ts-ignore react-18
    <Component ref={ref} {...(override ? {} : staticProps)} {...props} {...(override ? staticProps : {})} />
  ));
};

export default provideStaticProps;
