import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminUserEmailChangeDriftResolveMutation } from '@/core/apollo/generated/apollo-hooks';
import { OWN_ERROR_HANDLING } from '@/core/apollo/graphqlLinks/ownErrorHandling';
import { useServerErrorMessage } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { EMAIL_CHANGE_GENERIC_ERROR_KEY, mapEmailChangeErrorCode } from './emailChangeErrorMapping';

export type UseResolveUserEmailDriftProvided = {
  resolveDrift: (canonicalEmail: string) => Promise<boolean>;
  loading: boolean;
  errorMessage: string | undefined;
  clearError: () => void;
};

const useResolveUserEmailDrift = (userId: string): UseResolveUserEmailDriftProvided => {
  const { t } = useTranslation();
  const notify = useNotification();
  const serverErrorMessage = useServerErrorMessage();
  const [errorMessage, setErrorMessage] = useState<string>();

  const [resolveDriftMutation, { loading }] = useAdminUserEmailChangeDriftResolveMutation({
    // Every failure is shown inline in the dialog.
    context: OWN_ERROR_HANDLING,
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
      const key = mapEmailChangeErrorCode(code);
      setErrorMessage(key === EMAIL_CHANGE_GENERIC_ERROR_KEY ? serverErrorMessage(error, t(key)) : t(key));
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
