import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteContributionMutation,
  useDeleteLinkMutation,
  useUpdateLinkMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  LinkContributionDialog,
  type LinkContributionFormValues,
} from '@/crd/components/contribution/LinkContributionDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

type EditTarget = {
  contributionId: string;
  linkId: string;
  url: string;
  displayName: string;
  description?: string;
  /** When 'delete', the connector skips the edit form and opens the destructive confirmation dialog directly. */
  intent?: 'edit' | 'delete';
};

type LinkContributionEditConnectorProps = {
  target: EditTarget | undefined;
  onClose: () => void;
  /** When true, the edit dialog shows a delete button (and pending-delete confirmation). Defaults to false. */
  canDelete?: boolean;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export function LinkContributionEditConnector({
  target,
  onClose,
  canDelete,
  onSaved,
  onDeleted,
}: LinkContributionEditConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [pendingDelete, setPendingDelete] = useState(false);
  const directDeleteIntent = target?.intent === 'delete';
  const showDeleteConfirm = pendingDelete || directDeleteIntent;

  const [updateLink] = useUpdateLinkMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    awaitRefetchQueries: true,
  });
  const [deleteLink] = useDeleteLinkMutation();
  const [deleteContribution] = useDeleteContributionMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    awaitRefetchQueries: true,
  });

  const [handleSubmit, saving] = useLoadingState(async (values: LinkContributionFormValues) => {
    if (!target) return;
    await updateLink({
      variables: {
        input: {
          ID: target.linkId,
          uri: values.url,
          profile: {
            displayName: values.displayName,
            description: values.description || undefined,
          },
        },
      },
    });
    onSaved?.();
    onClose();
  });

  const [handleConfirmDelete, deleting] = useLoadingState(async () => {
    if (!target) return;
    // Mirror the MUI flow (CalloutContributionsLink): delete the inner Link, then
    // delete the contribution wrapper so the slot is removed from the callout's
    // contribution list. Deleting only the Link leaves an orphaned wrapper.
    await deleteLink({ variables: { input: { ID: target.linkId } } });
    await deleteContribution({ variables: { contributionId: target.contributionId } });
    setPendingDelete(false);
    onDeleted?.();
    onClose();
  });

  return (
    <>
      <LinkContributionDialog
        open={Boolean(target) && !showDeleteConfirm}
        onOpenChange={open => {
          if (saving || deleting) {
            return;
          }
          if (!open) {
            onClose();
          }
        }}
        mode="edit"
        initialValues={
          target
            ? {
                url: target.url,
                displayName: target.displayName,
                description: target.description ?? '',
              }
            : undefined
        }
        saving={saving}
        onDelete={canDelete ? () => setPendingDelete(true) : undefined}
        onSubmit={handleSubmit}
      />
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={open => {
          if (deleting) return;
          if (!open) {
            setPendingDelete(false);
            if (directDeleteIntent) {
              onClose();
            }
          }
        }}
        variant="destructive"
        title={t('callout.linkDeleteConfirmTitle')}
        description={t('callout.linkDeleteConfirmDescription')}
        confirmLabel={t('callout.linkDelete')}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setPendingDelete(false);
          if (directDeleteIntent) {
            onClose();
          }
        }}
      />
    </>
  );
}
