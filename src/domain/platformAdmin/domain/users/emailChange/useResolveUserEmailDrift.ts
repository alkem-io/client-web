import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminUserEmailChangeDriftResolveMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { mapEmailChangeErrorCode } from './emailChangeErrorMapping';

export type UseResolveUserEmailDriftProvided = {
  resolveDrift: (canonicalEmail: string) => Promise<boolean>;
  loading: boolean;
  errorMessage: string | undefined;
  clearError: () => void;
};

const useResolveUserEmailDrift = (userId: string): UseResolveUserEmailDriftProvided => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [errorMessage, setErrorMessage] = useState<string>();

  const [resolveDriftMutation, { loading }] = useAdminUserEmailChangeDriftResolveMutation({
    context: { skipGlobalErrorHandler: true },
    refetchQueries: ['platformAdminUsersList', 'LatestUserEmailChangeAuditEntry', 'UserEmailChangeAuditEntries'],
    awaitRefetchQueries: true,
  });

  const resolveDrift = async (canonicalEmail: string): Promise<boolean> => {
    setErrorMessage(undefined);
    try {
      const { data } = await resolveDriftMutation({ variables: { userID: userId, canonicalEmail } });
      const committedEmail = data?.adminUserEmailChangeDriftResolve.email ?? canonicalEmail;
      notify(t('pages.admin.users.emailChange.drift.resolveSuccess', { email: committedEmail }), 'success');
      return true;
    } catch (error) {
      const code =
        error instanceof ApolloError ? (error.graphQLErrors[0]?.extensions?.code as string | undefined) : undefined;
      setErrorMessage(t(mapEmailChangeErrorCode(code)));
      return false;
    }
  };

  return {
    resolveDrift,
    loading,
    errorMessage,
    clearError: () => setErrorMessage(undefined),
  };
};

export default useResolveUserEmailDrift;
