import { useEffect, useRef, useState } from 'react';
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
import {
  StorageConfigContextProvider,
  useStorageConfigContext,
} from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import { LinkTermsHelper } from './LinkTermsHelper';

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
  /** Owning callout — required for the file-upload storage context. */
  calloutId: string;
  target: EditTarget | undefined;
  onClose: () => void;
  /** When true, the edit dialog shows a delete button (and pending-delete confirmation). Defaults to false. */
  canDelete?: boolean;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export function LinkContributionEditConnector({
  calloutId,
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
  const editFormOpen = Boolean(target) && !showDeleteConfirm;

  const [deleteLink] = useDeleteLinkMutation();
  const [deleteContribution] = useDeleteContributionMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    awaitRefetchQueries: true,
  });

  // Track whether the inner Link has already been deleted in a previous attempt — on retry we
  // skip the deleteLink call (it would 404), but still need to clear the orphan contribution
  // wrapper. Cleared whenever a new target is opened.
  const linkAlreadyDeleted = useRef(false);
  useEffect(() => {
    if (!target) linkAlreadyDeleted.current = false;
  }, [target]);

  const [handleConfirmDelete, deleting] = useLoadingState(async () => {
    if (!target) return;
    // Mirror the MUI flow (CalloutContributionsLink): delete the inner Link, then
    // delete the contribution wrapper so the slot is removed from the callout's
    // contribution list. Deleting only the Link leaves an orphaned wrapper, so on
    // failure we keep the confirmation open and let the user retry — Apollo logs
    // the error and a snackbar surfaces it via the global error link.
    try {
      if (!linkAlreadyDeleted.current) {
        await deleteLink({ variables: { input: { ID: target.linkId } } });
        linkAlreadyDeleted.current = true;
      }
      await deleteContribution({ variables: { contributionId: target.contributionId } });
      linkAlreadyDeleted.current = false;
      setPendingDelete(false);
      onDeleted?.();
      onClose();
    } catch {
      // Stay on the confirmation dialog so the user can retry. State already reflects which
      // mutation succeeded via `linkAlreadyDeleted`, so a retry skips the half that's done.
    }
  });

  return (
    <>
      <StorageConfigContextProvider locationType="callout" calloutId={calloutId} skip={!editFormOpen}>
        <LinkEditDialog
          target={target}
          open={editFormOpen}
          canDelete={canDelete}
          onClose={onClose}
          onSaved={onSaved}
          onTriggerDelete={() => setPendingDelete(true)}
          deleting={deleting}
        />
      </StorageConfigContextProvider>
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

function LinkEditDialog({
  target,
  open,
  canDelete,
  onClose,
  onSaved,
  onTriggerDelete,
  deleting,
}: {
  target: EditTarget | undefined;
  open: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onSaved?: () => void;
  onTriggerDelete: () => void;
  deleting: boolean;
}) {
  const storageConfig = useStorageConfigContext();
  // Temporary uploads, which the server relocates when the link adopts one. The client never
  // deletes an upload: an abandoned one stays stored, and the server does not expire it yet.
  const referenceUpload = useReferenceFileUpload(storageConfig, { temporaryLocation: true, ownFailureToast: false });
  const [updateLink] = useUpdateLinkMutation({
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

  return (
    <LinkContributionDialog
      mode="edit"
      open={open}
      onOpenChange={next => {
        if (saving || deleting) return;
        if (!next) onClose();
      }}
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
      onDelete={canDelete ? onTriggerDelete : undefined}
      onSubmit={handleSubmit}
      onFileUpload={referenceUpload.onFileUpload}
      uploadAccept={referenceUpload.accept}
      urlHelperSlot={<LinkTermsHelper />}
    />
  );
}
