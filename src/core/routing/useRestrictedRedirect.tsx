import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';
import { useLocation, useNavigate, NavigateOptions } from 'react-router-dom';
import { useEffect } from 'react';
import { isApolloAuthorizationError } from '../apollo/hooks/useApolloErrorHandler';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { AUTH_REQUIRED_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';

interface RestrictedRedirectQueryResponse<Data extends {}> {
  data?: Data;
  error?: ApolloError;
  skip?: boolean;
}

interface PrivilegesReader<Data> {
  (data: Data): AuthorizationPrivilege[] | undefined;
}

interface RestrictedRedirectOptions extends NavigateOptions {
  requiredPrivilege?: AuthorizationPrivilege;
}

const DEFAULT_NAVIGATE_OPTIONS: NavigateOptions = {
  replace: true,
};

const useRestrictedRedirect = <Data extends {}>(
  { data, error, skip = false }: RestrictedRedirectQueryResponse<Data>,
  readPrivileges: PrivilegesReader<Data>,
  {
    requiredPrivilege = AuthorizationPrivilege.Read,
    ...navigateOptions
  }: RestrictedRedirectOptions = DEFAULT_NAVIGATE_OPTIONS
) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUserContext();

  const redirectUrl = `/restricted?origin=${encodeURI(pathname)}`;

  useEffect(() => {
    if (skip) {
      return;
    }

    // Check for authorization error first
    if (isApolloAuthorizationError(error)) {
      // If we have an authorization error, check authentication
      if (!isAuthenticated) {
        // Not authenticated with auth error -> redirect to sign in
        navigate(`${AUTH_REQUIRED_PATH}${buildReturnUrlParam(pathname)}`);
        return;
      } else {
        // Authenticated but authorization error -> redirect to restricted
        navigate(redirectUrl, navigateOptions);
        return;
      }
    }

    // Check privileges authorization error
    const privileges = data ? readPrivileges(data) : undefined;

    if (data && !privileges?.includes(requiredPrivilege)) {
      navigate(redirectUrl, navigateOptions);
      return;
    }
  }, [data, error, skip, isAuthenticated]);
};

export default useRestrictedRedirect;
