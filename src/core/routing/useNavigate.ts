import {
  useNavigate as reactRouterUseNavigate,
  NavigateOptions as ReactRouterNavigateOptions,
  To,
} from 'react-router-dom';
import { useCallback } from 'react';
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

  return useCallback(
    (to: To | number, options?: NavigationOptions) => {
      if (typeof to === 'number') {
        return navigate(to);
      }

      const normalizedTo = options?.strict ? to : normalizeTo(to);

      return navigate(normalizedTo, options);
    },
    [navigate]
  );
};

export default useNavigate;
