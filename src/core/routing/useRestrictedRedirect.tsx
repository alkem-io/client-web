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

    if (!isAuthenticated) {
      navigate(`${AUTH_REQUIRED_PATH}${buildReturnUrlParam(pathname)}`);
      return;
    }

    const privileges = data ? readPrivileges(data) : undefined;

    if (isApolloAuthorizationError(error)) {
      navigate(redirectUrl, navigateOptions);
      return;
    }

    if (data && !privileges?.includes(requiredPrivilege)) {
      navigate(redirectUrl, navigateOptions);
      return;
    }
  }, [data, error, skip, isAuthenticated]);
};

export default useRestrictedRedirect;
