import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminUserEmailChangeMutation } from '@/core/apollo/generated/apollo-hooks';
import { OWN_ERROR_HANDLING } from '@/core/apollo/graphqlLinks/ownErrorHandling';
import { useServerErrorMessage } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { EMAIL_CHANGE_GENERIC_ERROR_KEY, mapEmailChangeErrorCode } from './emailChangeErrorMapping';

export type ChangeUserEmailRequest = {
  newEmail: string;
  reason: string;
  approver: {
    name: string;
    role: string;
    organization: string;
  };
};

export type UseChangeUserEmailProvided = {
  changeEmail: (request: ChangeUserEmailRequest) => Promise<boolean>;
  loading: boolean;
  errorMessage: string | undefined;
  clearError: () => void;
};

const useChangeUserEmail = (userId: string): UseChangeUserEmailProvided => {
  const { t } = useTranslation();
  const notify = useNotification();
  const serverErrorMessage = useServerErrorMessage();
  const [errorMessage, setErrorMessage] = useState<string>();

  const [changeEmailMutation, { loading }] = useAdminUserEmailChangeMutation({
    // Every failure is shown inline in the dialog.
    context: OWN_ERROR_HANDLING,
    refetchQueries: ['platformAdminUsersList', 'LatestUserEmailChangeAuditEntry', 'UserEmailChangeAuditEntries'],
    awaitRefetchQueries: true,
  });

  const changeEmail = async ({ newEmail, reason, approver }: ChangeUserEmailRequest): Promise<boolean> => {
    setErrorMessage(undefined);
    try {
      const { data } = await changeEmailMutation({
        variables: {
          userID: userId,
          newEmail,
          reason: reason.trim(),
          approver: {
            name: approver.name.trim(),
            role: approver.role.trim(),
            organization: approver.organization.trim() || undefined,
          },
        },
      });
      const result = data?.adminUserEmailChange;
      if (!result?.success || !result.email) {
        setErrorMessage(t(EMAIL_CHANGE_GENERIC_ERROR_KEY));
        return false;
      }
      notify(t('pages.admin.users.emailChange.success', { email: result.email }), 'success');
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
    changeEmail,
    loading,
    errorMessage,
    clearError: () => setErrorMessage(undefined),
  };
};

export default useChangeUserEmail;
