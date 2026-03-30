import {
  type NavigateOptions as ReactRouterNavigateOptions,
  useNavigate as reactRouterUseNavigate,
  type To,
} from 'react-router-dom';
import { normalizeLink } from '../utils/links';

interface NavigationOptions extends ReactRouterNavigateOptions {
  strict?: boolean;
}

const normalizeTo = (to: To) => {
  if (typeof to === 'string') {
    return normalizeLink(to);
  }
  if (!to.pathname) {
    return to;
  }
  return {
    ...to,
    pathname: normalizeLink(to.pathname),
  };
};

const useNavigate = () => {
  const navigate = reactRouterUseNavigate();

  return (to: To | number, options?: NavigationOptions) => {
    if (typeof to === 'number') {
      return navigate(to);
    }

    const normalizedTo = options?.strict ? to : normalizeTo(to);

    return navigate(normalizedTo, options);
  };
};

export default useNavigate;
