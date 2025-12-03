import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';
import { useEffect } from 'react';
import { isApolloAuthorizationError } from '../apollo/hooks/useApolloErrorHandler';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { NotAuthorizedError } from '../40XErrorHandler/40XErrors';
import { useLocation } from 'react-router-dom';
import { AUTH_REQUIRED_PATH } from '../auth/authentication/constants/authentication.constants';

interface RestrictedRedirectQueryResponse<Data extends {}> {
  data?: Data;
  error?: ApolloError;
  skip?: boolean;
}

interface PrivilegesReader<Data> {
  (data: Data): AuthorizationPrivilege[] | undefined;
}

interface RestrictedRedirectOptions {
  requiredPrivilege?: AuthorizationPrivilege;
}

const useRestrictedRedirect = <Data extends {}>(
  { data, error, skip = false }: RestrictedRedirectQueryResponse<Data>,
  readPrivileges: PrivilegesReader<Data>,
  { requiredPrivilege = AuthorizationPrivilege.Read }: RestrictedRedirectOptions
) => {
  const location = useLocation();
  const { isAuthenticated } = useCurrentUserContext();

  useEffect(() => {
    if (skip) {
      return;
    }

    // Check for authorization error first
    if (isApolloAuthorizationError(error)) {
      // If we have an authorization error, check authentication
      if (!isAuthenticated) {
        // Not authenticated with auth error -> redirect to sign in
        throw new NotAuthorizedError({ redirectUrl: `${AUTH_REQUIRED_PATH}${location.pathname}` });
      } else {
        // Authenticated but authorization error -> redirect to restricted
        throw new NotAuthorizedError();
      }
    }

    // Check privileges authorization error
    const privileges = data ? readPrivileges(data) : undefined;

    if (data && !privileges?.includes(requiredPrivilege)) {
      throw new NotAuthorizedError();
    }
  }, [data, error, skip, isAuthenticated]);
};

export default useRestrictedRedirect;
