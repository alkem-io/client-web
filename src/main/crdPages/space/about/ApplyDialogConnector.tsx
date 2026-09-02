import { useApplicationDialogQuery, useApplyForEntryRoleOnRoleSetMutation } from '@/core/apollo/generated/apollo-hooks';
import type { CreateNvpInput } from '@/core/apollo/generated/graphql-schema';
import {
  type ApplicationAnswer,
  ApplicationFormDialog,
  type ApplicationQuestion,
} from '@/crd/components/community/ApplicationFormDialog';

type ApplyDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  canJoinCommunity: boolean;
  onJoin: () => void;
  onApplied: () => void;
};

export function ApplyDialogConnector({
  open,
  onOpenChange,
  spaceId,
  canJoinCommunity,
  onJoin,
  onApplied,
}: ApplyDialogConnectorProps) {
  const { data } = useApplicationDialogQuery({
    variables: { spaceId },
    skip: !open || !spaceId || canJoinCommunity,
  });

  const [applyForEntryRoleOnRoleSet, { loading: submitting }] = useApplyForEntryRoleOnRoleSetMutation();

  const spaceAbout = data?.lookup.space?.about;
  const communityName = spaceAbout?.profile.displayName;
  const formDescription = spaceAbout?.membership.applicationForm?.description ?? undefined;
  const questions: ApplicationQuestion[] = (spaceAbout?.membership.applicationForm?.questions ?? []).map(q => ({
    question: q.question,
    required: q.required,
    maxLength: q.maxLength,
    sortOrder: q.sortOrder ?? 0,
  }));
  const roleSetId = spaceAbout?.membership.roleSetID;
  const guidelines = spaceAbout?.guidelines.profile
    ? {
        displayName: spaceAbout.guidelines.profile.displayName,
        description: spaceAbout.guidelines.profile.description ?? undefined,
        references: spaceAbout.guidelines.profile.references?.map(r => ({
          name: r.name,
          uri: r.uri,
          description: r.description ?? undefined,
        })),
      }
    : undefined;

  // FR-025: on mutation failure, Apollo's global error handler surfaces the toast.
  // The dialog stays open because we only close on success — the user can retry without re-entering data.
  const handleSubmit = async (answers: ApplicationAnswer[]) => {
    if (canJoinCommunity) {
      onJoin();
      onOpenChange(false);
      return;
    }
    if (!roleSetId) {
      return;
    }
    const questionPayload: CreateNvpInput[] = answers.map(a => ({
      name: a.name,
      value: a.value,
      sortOrder: a.sortOrder,
    }));
    await applyForEntryRoleOnRoleSet({
      variables: {
        roleSetId,
        questions: questionPayload,
      },
    });
    onOpenChange(false);
    onApplied();
  };

  return (
    <ApplicationFormDialog
      open={open}
      onOpenChange={onOpenChange}
      communityName={communityName}
      formDescription={formDescription}
      questions={canJoinCommunity ? [] : questions}
      guidelines={guidelines}
      mode={canJoinCommunity ? 'join' : 'apply'}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
