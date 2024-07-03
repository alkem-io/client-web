import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isApolloForbiddenError } from '../apollo/hooks/useApolloErrorHandler';

interface RestrictedRedirectQueryResponse<Data extends {}> {
  data?: Data;
  error?: ApolloError;
}

interface PrivilegesReader<Data> {
  (data: Data): AuthorizationPrivilege[] | undefined;
}

const useRestrictedRedirect = <Data extends {}>(
  { data, error }: RestrictedRedirectQueryResponse<Data>,
  readPrivileges: PrivilegesReader<Data>,
  requiredPrivilege = AuthorizationPrivilege.Read
) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const redirectUrl = `/restricted?origin=${encodeURI(pathname)}`;

  useEffect(() => {
    if (error && isApolloForbiddenError(error)) {
      navigate(redirectUrl);
    }

    if (data && !readPrivileges(data)?.includes(requiredPrivilege)) {
      navigate(redirectUrl);
    }
  }, [data, error]);
};

export default useRestrictedRedirect;
