import { useApolloClient } from '@apollo/client';
import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateLinkOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
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
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import { LinkTermsHelper } from './LinkTermsHelper';

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
  // Temporary uploads, which the server relocates when a link adopts them. The client never deletes
  // an upload: an abandoned one stays stored, and the server does not expire it yet.
  const referenceUpload = useReferenceFileUpload(storageConfig, { temporaryLocation: true, ownFailureToast: false });
  const [createLink] = useCreateLinkOnCalloutMutation();
  const client = useApolloClient();

  const [handleSubmit, saving] = useLoadingState(async (rows: LinkContributionFormValues[]) => {
    // Create all rows in parallel, then refresh the list once after every row has settled: the
    // rows commit in no fixed order, so no single row's mutation can carry the refresh.
    const results = await Promise.allSettled(
      rows.map(row =>
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
        })
      )
    );
    if (results.some(result => result.status === 'fulfilled')) {
      try {
        await client.refetchQueries({ include: ['CalloutDetails', 'CalloutContributions'] });
      } catch {
        // The links exist; a failed list refresh only delays seeing them.
      }
    }
    const failure = results.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
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
      onFileUpload={referenceUpload.onFileUpload}
      uploadAccept={referenceUpload.accept}
      urlHelperSlot={<LinkTermsHelper />}
    />
  );
}
