import { useEffect, ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import useUrlResolver from './useUrlResolver';
import { useUrlParams } from '@/core/routing/useUrlParams';

/**
 * Higher-Order Component (HOC) that updates the UrlResolverProvider with URL parameters.
 *
 * This HOC wraps a given component and ensures that the URL parameters are set in the UrlResolverProvider
 * whenever the location changes. It uses the `useUrlResolver` and `useUrlParams` hooks to achieve this.
 *
 * @param WrappedComponent - The component to be wrapped by this HOC.
 * @returns A new component that wraps the given component and updates the UrlResolverProvider with URL parameters.
 *
 */
const withUrlResolverParams = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return (props: P) => {
    const { setUrlParams } = useUrlResolver();
    const location = useLocation();
    const urlParams = useUrlParams();

    useEffect(() => {
      // The * comes from the react router, this is the wildcard for rest of the URL and must be skipped here
      const { '*': _, ...filteredUrlParams } = urlParams;
      console.log('>>>>> url changed effect:', document.location.href, filteredUrlParams);
      setUrlParams(document.location.href, filteredUrlParams);
    }, [location]);

    return <WrappedComponent {...props} />;
  };
};

export default withUrlResolverParams;
