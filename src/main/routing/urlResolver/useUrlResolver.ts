import { useContext } from 'react';
import { UrlResolverContext } from './UrlResolverProvider';

const useUrlResolver = () => useContext(UrlResolverContext);
export default useUrlResolver;
