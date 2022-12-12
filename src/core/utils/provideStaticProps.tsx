import { ComponentType, forwardRef } from 'react';

const provideStaticProps = <Props extends {}>(Component: ComponentType<Props>, staticProps: Partial<Props>) => {
  return forwardRef<ComponentType<Props>, Props>((props, ref) => <Component ref={ref} {...staticProps} {...props} />);
};

export default provideStaticProps;
