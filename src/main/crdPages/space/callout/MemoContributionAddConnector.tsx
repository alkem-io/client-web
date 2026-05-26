import { StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateMemoOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';

// `open` + `onOpenChange` form a discriminated pair: pass both (controlled) or neither
// (uncontrolled). Passing only one would compile but leave the dialog inert in one direction.
type ControlledOpen = { open: boolean; onOpenChange: (open: boolean) => void };
type UncontrolledOpen = { open?: undefined; onOpenChange?: undefined };

type MemoContributionAddConnectorProps = {
  calloutId: string;
  defaultDisplayName?: string;
  defaultMarkdown?: string;
  onCreated?: () => void;
  /** When true, suppresses the in-grid trigger card; a parent renders its own trigger and controls `open`. */
  inlineTrigger?: boolean;
} & (ControlledOpen | UncontrolledOpen);

export function MemoContributionAddConnector({
  calloutId,
  defaultDisplayName,
  defaultMarkdown,
  onCreated,
  inlineTrigger,
  open: controlledOpen,
  onOpenChange,
}: MemoContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const fallbackName = defaultDisplayName ?? t('callout.defaultMemoName');
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const createDialogOpen = isControlled ? controlledOpen : internalOpen;
  const setCreateDialogOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [memoName, setMemoName] = useState(fallbackName);
  const [editingMemoId, setEditingMemoId] = useState<string | undefined>();
  const [createMemo] = useCreateMemoOnCalloutMutation();

  const handleOpenCreate = () => {
    setMemoName(fallbackName);
    setCreateDialogOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateDialogOpen(false);
  };

  // When the parent opens the dialog (inline-trigger path), reset the name to the fallback.
  // This mirrors what `handleOpenCreate` does for the in-grid trigger card path.
  useEffect(() => {
    if (createDialogOpen) setMemoName(fallbackName);
  }, [createDialogOpen, fallbackName]);

  const [handleCreate, creating] = useLoadingState(async () => {
    const trimmed = memoName.trim();
    if (!trimmed) return;
    const { data } = await createMemo({
      variables: {
        calloutId,
        memo: {
          profile: { displayName: trimmed },
          markdown: defaultMarkdown ?? '',
        },
      },
      refetchQueries: ['CalloutContributions'],
      awaitRefetchQueries: true,
    });
    onCreated?.();
    handleCloseCreate();
    const createdMemoId = data?.createContributionOnCallout.memo?.id;
    if (createdMemoId) {
      setEditingMemoId(createdMemoId);
    }
  });

  return (
    <>
      {!inlineTrigger && (
        <ContributionAddCard label={t('callout.addMemo')} icon={StickyNote} onClick={handleOpenCreate} />
      )}
      <Dialog
        open={createDialogOpen}
        onOpenChange={open => {
          if (!open) handleCloseCreate();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('callout.createMemo')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor="crd-create-memo-name" className="text-caption text-muted-foreground">
              {t('callout.memoNameLabel')}
            </label>
            <Input
              id="crd-create-memo-name"
              value={memoName}
              onChange={e => setMemoName(e.target.value)}
              autoFocus={true}
              disabled={creating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreate} disabled={creating}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!memoName.trim() || creating} aria-busy={creating}>
              {t('dialogs.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {editingMemoId && (
        <CrdMemoDialog
          open={true}
          memoId={editingMemoId}
          isContribution={true}
          onClose={() => setEditingMemoId(undefined)}
        />
      )}
    </>
  );
}
