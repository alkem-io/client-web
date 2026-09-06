import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { CrdPostContributionDialog } from '@/main/crdPages/post/CrdPostContributionDialog';

// `open` + `onOpenChange` form a discriminated pair: pass both (controlled) or neither
// (uncontrolled). Passing only one would compile but leave the dialog inert in one direction.
type ControlledOpen = { open: boolean; onOpenChange: (open: boolean) => void };
type UncontrolledOpen = { open?: undefined; onOpenChange?: undefined };

type PostContributionAddConnectorProps = {
  calloutId: string;
  defaultDisplayName?: string;
  defaultDescription?: string;
  /** Tasks board only: the column the new post starts in (server defaults to the first column). */
  taskColumn?: string;
  /**
   * Tasks board only: retitles the creation dialog and submit button in
   * task-specific terms. Generic callers leave it false so their strings are
   * unchanged.
   */
  isTaskBoard?: boolean;
  onCreated?: () => void;
  /** When true, suppresses the in-grid trigger card; a parent renders its own trigger and controls `open`. */
  inlineTrigger?: boolean;
  /** Escape hatch to raise the dialog above a custom overlay (e.g. the fullscreen task board). */
  overlayClassName?: string;
  contentClassName?: string;
} & (ControlledOpen | UncontrolledOpen);

export function PostContributionAddConnector({
  calloutId,
  defaultDisplayName,
  defaultDescription,
  taskColumn,
  isTaskBoard,
  onCreated,
  inlineTrigger,
  overlayClassName,
  contentClassName,
  open: controlledOpen,
  onOpenChange,
}: PostContributionAddConnectorProps) {
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
        <ContributionAddCard label={t('callout.addPost')} icon={MessageSquare} onClick={() => setOpen(true)} />
      )}
      {open && (
        // Scope uploads to the callout's framing bucket (where a contributing member has
        // FileUpload) instead of the ambient space bucket. `CrdPostContributionDialog` passes
        // `temporaryLocation: true` in create mode so the server relocates files to the new
        // post on save. Mirrors `LinkContributionAddConnector`.
        <StorageConfigContextProvider locationType="callout" calloutId={calloutId} skip={!open}>
          <CrdPostContributionDialog
            open={open}
            onOpenChange={setOpen}
            mode="create"
            calloutId={calloutId}
            defaultDisplayName={defaultDisplayName}
            defaultDescription={defaultDescription}
            taskColumn={taskColumn}
            isTaskBoard={isTaskBoard}
            overlayClassName={overlayClassName}
            contentClassName={contentClassName}
            onCreated={() => {
              onCreated?.();
            }}
          />
        </StorageConfigContextProvider>
      )}
    </>
  );
}
