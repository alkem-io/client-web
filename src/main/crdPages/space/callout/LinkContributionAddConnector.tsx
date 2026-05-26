import { Link2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateLinkOnCalloutMutation, useDeleteDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import {
  LinkContributionDialog,
  type LinkContributionFormValues,
} from '@/crd/components/contribution/LinkContributionDialog';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  StorageConfigContextProvider,
  useStorageConfigContext,
} from '@/domain/storage/StorageBucket/StorageConfigContext';
import { LinkTermsHelper } from './LinkTermsHelper';
import { LinkUrlAttachFileButton } from './LinkUrlAttachFileButton';

// `open` + `onOpenChange` form a discriminated pair: pass both (controlled) or neither
// (uncontrolled). Passing only one would compile but leave the dialog inert in one direction.
type ControlledOpen = { open: boolean; onOpenChange: (open: boolean) => void };
type UncontrolledOpen = { open?: undefined; onOpenChange?: undefined };

type LinkContributionAddConnectorProps = {
  calloutId: string;
  onCreated?: () => void;
  /** When true, renders a small inline "+ Add link" button instead of the full add card.
   *  Used by the list-view feed branch where the Add affordance lives inside `ContributionLinkList`. */
  inlineTrigger?: boolean;
} & (ControlledOpen | UncontrolledOpen);

export function LinkContributionAddConnector({
  calloutId,
  onCreated,
  inlineTrigger,
  open: controlledOpen,
  onOpenChange,
}: LinkContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <>
      {!inlineTrigger && (
        <ContributionAddCard label={t('callout.addLinkOrFile')} icon={Link2} onClick={() => setOpen(true)} />
      )}
      <StorageConfigContextProvider locationType="callout" calloutId={calloutId} skip={!open}>
        <LinkAddDialog calloutId={calloutId} open={open} onOpenChange={setOpen} onCreated={onCreated} />
      </StorageConfigContextProvider>
    </>
  );
}

function LinkAddDialog({
  calloutId,
  open,
  onOpenChange,
  onCreated,
}: {
  calloutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const storageConfig = useStorageConfigContext();
  // Documents uploaded into the temporary bucket during this dialog session, keyed by the row id
  // they belong to. Removing a row deletes that row's doc; cancelling the dialog deletes them all.
  // On successful submit, links capture the document URLs and the temp ids are forgotten.
  const uploadedDocIds = useRef<Map<string, string>>(new Map());
  const [createLink] = useCreateLinkOnCalloutMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const deleteOneRow = async (rowId: string) => {
    const documentId = uploadedDocIds.current.get(rowId);
    if (!documentId) return;
    uploadedDocIds.current.delete(rowId);
    try {
      await deleteDocument({ variables: { documentId } });
    } catch {
      // Best-effort cleanup — the document may already be gone or unreachable.
    }
  };

  const deleteAllRows = async () => {
    const ids = Array.from(uploadedDocIds.current.values());
    uploadedDocIds.current.clear();
    await Promise.all(
      ids.map(documentId =>
        deleteDocument({ variables: { documentId } }).catch(() => {
          // Best-effort cleanup.
        })
      )
    );
  };

  const [handleSubmit, saving] = useLoadingState(async (rows: LinkContributionFormValues[]) => {
    // Create all rows in parallel — matches MUI's CreateLinksDialog.handleSaveNewLinks. The
    // refetch is deferred to the final mutation so the contributions list reloads once, not N times.
    await Promise.all(
      rows.map((row, i) =>
        createLink({
          variables: {
            calloutId,
            link: {
              uri: row.url,
              profile: {
                displayName: row.displayName,
                description: row.description || undefined,
              },
            },
          },
          ...(i === rows.length - 1
            ? {
                refetchQueries: ['CalloutDetails', 'CalloutContributions'],
                awaitRefetchQueries: true,
              }
            : {}),
        })
      )
    );
    uploadedDocIds.current.clear();
    onOpenChange(false);
    onCreated?.();
  });

  return (
    <LinkContributionDialog
      mode="create"
      open={open}
      onOpenChange={onOpenChange}
      saving={saving}
      onSubmit={handleSubmit}
      onRowRemoved={rowId => {
        void deleteOneRow(rowId);
      }}
      onCancel={() => {
        void deleteAllRows();
      }}
      urlAdornment={({ rowId, setUrl, setDisplayName }) => (
        <LinkUrlAttachFileButton
          storageConfig={storageConfig}
          disabled={saving}
          onUploaded={({ url, documentId, fileName }) => {
            // Replacing an existing upload on the same row: delete the previous one first.
            const prev = uploadedDocIds.current.get(rowId);
            if (prev) {
              deleteDocument({ variables: { documentId: prev } }).catch(() => {});
            }
            uploadedDocIds.current.set(rowId, documentId);
            setUrl(url);
            setDisplayName(fileName);
          }}
        />
      )}
      urlHelperSlot={<LinkTermsHelper />}
    />
  );
}
