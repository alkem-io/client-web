import { useNavigate as reactRouterUseNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { NavigateOptions as ReactRouterNavigateOptions } from 'react-router/lib/hooks';
import type { To } from 'history';
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

      console.log(normalizedTo);

      return navigate(normalizedTo, options);
    },
    [navigate]
  );
};

export default useNavigate;
