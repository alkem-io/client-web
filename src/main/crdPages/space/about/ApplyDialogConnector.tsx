import { useApplyForEntryRoleOnRoleSetMutation } from '@/core/apollo/generated/apollo-hooks';
import type { CreateNvpInput } from '@/core/apollo/generated/graphql-schema';
import {
  type ApplicationAnswer,
  ApplicationFormDialog,
  type ApplicationQuestion,
} from '@/crd/components/community/ApplicationFormDialog';
import { pageSpace } from '@/domain/space/context/spacePageShellMapper';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';
import { nativeGuidelines } from '../dataMappers/spacePageDataMapper';

/** Space.applicationForm, the core.application_form section (SpaceSettingsApplicationForm.v2.graphql). */
type ApplicationFormJson = {
  description?: string | null;
  questions?: { question: string; required: boolean; max_length: number; sort_order: number }[];
} | null;

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
  // The space's D2 document, already cached by the page; the role set is the space itself (no wrapper id natively).
  const space = pageSpace(useSpacePageData(spaceId || undefined, 'space')?.node, spaceId);
  const communityName = space?.about.displayName;
  const roleSetId = space?.id;
  const form = space?.applicationForm as ApplicationFormJson | undefined;
  const questions: ApplicationQuestion[] = (form?.questions ?? []).map(q => ({
    question: q.question,
    required: q.required,
    maxLength: q.max_length,
    sortOrder: q.sort_order,
  }));

  const [applyForEntryRoleOnRoleSet, { loading: submitting }] = useApplyForEntryRoleOnRoleSetMutation();

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
      formDescription={form?.description ?? undefined}
      questions={canJoinCommunity ? [] : questions}
      guidelines={nativeGuidelines(space) ?? undefined}
      mode={canJoinCommunity ? 'join' : 'apply'}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
