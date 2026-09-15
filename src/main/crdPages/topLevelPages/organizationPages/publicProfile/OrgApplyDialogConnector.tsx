import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useApplyForEntryRoleOnRoleSetMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type ApplicationAnswer,
  ApplicationFormDialog,
  type ApplicationQuestion,
} from '@/crd/components/community/ApplicationFormDialog';
import {
  ApplicationSubmittedBellIcon,
  ApplicationSubmittedDialog,
} from '@/crd/components/community/ApplicationSubmittedDialog';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

export type OrgApplyDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  roleSetId: string;
  /** The organization role set's seeded application form (OrganizationInfo fragment). */
  applicationForm?: {
    questions: { question: string; required: boolean; maxLength: number; sortOrder?: number | null }[];
  } | null;
  /** After a successful submission, lets the caller flip the hero to "Application pending" without a refetch round-trip. */
  onSubmitted: () => void;
};

const graphQLErrorCode = (error: unknown): string | undefined =>
  error instanceof ApolloError ? (error.graphQLErrors[0]?.extensions?.code as string | undefined) : undefined;

/**
 * Wires the shared `ApplicationFormDialog` to the organization apply mutation, with
 * organization wording throughout ("associate", never "member"/"community"). The
 * organization's seeded application form has exactly one, optional question, rendered
 * as an optional-message field: the cue the user reads is the organization copy, while
 * the form's own question text is still what gets persisted as the answer's name, so
 * admins reviewing the application see the form's question rather than a viewer-locale
 * label. A form with several questions is rendered verbatim; the local optional-message
 * question is only a fallback for a role set with no form questions.
 */
export function OrgApplyDialogConnector({
  open,
  onOpenChange,
  organizationName,
  roleSetId,
  applicationForm,
  onSubmitted,
}: OrgApplyDialogConnectorProps) {
  const { t } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const formQuestions: ApplicationQuestion[] = (applicationForm?.questions ?? []).map(q => ({
    question: q.question,
    required: q.required,
    maxLength: q.maxLength,
    sortOrder: q.sortOrder ?? 0,
  }));
  const messageLabel = t('orgProfile.applyDialog.messageLabel');
  const questions: ApplicationQuestion[] =
    formQuestions.length === 1
      ? [{ ...formQuestions[0], label: messageLabel }]
      : formQuestions.length > 1
        ? formQuestions
        : [{ question: messageLabel, required: false, maxLength: 512 }];
  const [submitted, setSubmitted] = useState(false);
  const [runApply, { loading: submitting }] = useApplyForEntryRoleOnRoleSetMutation();

  const handleSubmit = async (answers: ApplicationAnswer[]) => {
    try {
      await runApply({
        variables: {
          roleSetId,
          questions: answers.map(a => ({ name: a.name, value: a.value, sortOrder: a.sortOrder })),
        },
        // The failure is reported right below; the global error link must not add a second toast.
        context: { skipGlobalErrorHandler: true },
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
    return (
      <ApplicationSubmittedDialog
        open={open}
        onOpenChange={handleClose}
        communityName={organizationName}
        copy={{
          title: t('orgProfile.applyDialog.submitted'),
          body: t('orgProfile.applyDialog.submittedBody', { organizationName }),
          review: (
            <Trans
              t={t}
              i18nKey="orgProfile.applyDialog.submittedReview"
              components={{ bell: <ApplicationSubmittedBellIcon /> }}
            />
          ),
        }}
      />
    );
  }

  return (
    <ApplicationFormDialog
      open={open}
      onOpenChange={handleClose}
      communityName={organizationName}
      questions={questions}
      mode="apply"
      submitting={submitting}
      onSubmit={handleSubmit}
      copy={{
        title: t('orgProfile.applyDialog.title', { organizationName }),
        subheader: t('orgProfile.applyDialog.messageOptional'),
        submitLabel: t('orgProfile.applyDialog.submit'),
      }}
    />
  );
}
