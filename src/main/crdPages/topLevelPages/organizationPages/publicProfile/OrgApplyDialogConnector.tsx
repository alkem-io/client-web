import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApplyForEntryRoleOnRoleSetMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { type ApplicationAnswer, ApplicationFormDialog } from '@/crd/components/community/ApplicationFormDialog';
import { ApplicationSubmittedDialog } from '@/crd/components/community/ApplicationSubmittedDialog';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

export type OrgApplyDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  roleSetId: string;
  /** After a successful submission, lets the caller flip the hero to "Application pending" without a refetch round-trip. */
  onSubmitted: () => void;
};

const graphQLErrorCode = (error: unknown): string | undefined =>
  error instanceof ApolloError ? (error.graphQLErrors[0]?.extensions?.code as string | undefined) : undefined;

/**
 * Wires the shared `ApplicationFormDialog` to the organization apply mutation.
 * The organization's seeded application form has exactly one, optional question
 * (D13/FR-011) — relabelled here rather than shown verbatim, and rendered with no
 * form description (the product email: "skip the full application form").
 */
export function OrgApplyDialogConnector({
  open,
  onOpenChange,
  organizationName,
  roleSetId,
  onSubmitted,
}: OrgApplyDialogConnectorProps) {
  const { t } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [runApply, { loading: submitting }] = useApplyForEntryRoleOnRoleSetMutation();

  const handleSubmit = async (answers: ApplicationAnswer[]) => {
    try {
      await runApply({
        variables: {
          roleSetId,
          questions: answers.map(a => ({ name: a.name, value: a.value, sortOrder: a.sortOrder })),
        },
      });
      setSubmitted(true);
      onSubmitted();
    } catch (error) {
      const code = graphQLErrorCode(error);
      notify(
        code === AlkemioGraphqlErrorCode.ROLESET_APPLICATIONS_NOT_ACCEPTED
          ? t('orgProfile.associate.closed')
          : t('orgProfile.applyDialog.error'),
        'error'
      );
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) setSubmitted(false);
    onOpenChange(next);
  };

  if (submitted) {
    return <ApplicationSubmittedDialog open={open} onOpenChange={handleClose} communityName={organizationName} />;
  }

  return (
    <ApplicationFormDialog
      open={open}
      onOpenChange={handleClose}
      communityName={organizationName}
      questions={[
        {
          question: t('orgProfile.applyDialog.messageLabel'),
          required: false,
          maxLength: 512,
        },
      ]}
      mode="apply"
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
