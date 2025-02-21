import { useEffect, ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import useUrlResolver from './useUrlResolver';

/**
 * Higher-Order Component (HOC) that updates the UrlResolverProvider with URL parameters.
 *
 * This HOC wraps a given component and ensures that the URL parameters are set in the UrlResolverProvider
 * whenever the location changes. It uses the `useUrlResolver` and `useUrlParams` hooks to achieve this.
 *
 * @param WrappedComponent - The component to be wrapped by this HOC.
 * @returns A new component that wraps the given component and updates the UrlResolverProvider with URL parameters.
 *
 * */
const withUrlResolverParams = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return (props: P) => {
    const { setUrlParams } = useUrlResolver();
    const location = useLocation();
    //const urlParams = useUrlParams();

    useEffect(() => {
      // don't change the *, this is the wildcard for rest of the URL (must be skipped)
      // const { '*': _, ...filteredUrlParams } = urlParams;
      setUrlParams(document.location.href);
    }, [location]);

    return <WrappedComponent {...props} />;
  };
};

export default withUrlResolverParams;
