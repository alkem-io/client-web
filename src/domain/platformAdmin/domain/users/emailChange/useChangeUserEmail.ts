import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminUserEmailChangeMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { mapEmailChangeErrorCode } from './emailChangeErrorMapping';

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
  const [errorMessage, setErrorMessage] = useState<string>();

  const [changeEmailMutation, { loading }] = useAdminUserEmailChangeMutation({
    context: { skipGlobalErrorHandler: true },
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
      const committedEmail = data?.adminUserEmailChange.email ?? newEmail;
      notify(t('pages.admin.users.emailChange.success', { email: committedEmail }), 'success');
      return true;
    } catch (error) {
      const code =
        error instanceof ApolloError ? (error.graphQLErrors[0]?.extensions?.code as string | undefined) : undefined;
      setErrorMessage(t(mapEmailChangeErrorCode(code)));
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
