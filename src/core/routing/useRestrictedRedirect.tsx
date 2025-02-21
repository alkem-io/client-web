import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';
import { useLocation, useNavigate, NavigateOptions } from 'react-router-dom';
import { useEffect } from 'react';
import { isApolloForbiddenError } from '../apollo/hooks/useApolloErrorHandler';

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

  const redirectUrl = `/restricted?origin=${encodeURI(pathname)}`;

  useEffect(() => {
    if (skip) {
      return;
    }

    if (error && isApolloForbiddenError(error)) {
      navigate(redirectUrl, navigateOptions);
    }

    if (data && !readPrivileges(data)?.includes(requiredPrivilege)) {
      navigate(redirectUrl, navigateOptions);
    }
  }, [data, error, skip]);
};

export default useRestrictedRedirect;
