import { StickyNote } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateMemoOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { CrdMemoDialog } from '@/main/crdPages/memo/CrdMemoDialog';

type MemoContributionAddConnectorProps = {
  calloutId: string;
  defaultDisplayName?: string;
  defaultMarkdown?: string;
  onCreated?: () => void;
};

export function MemoContributionAddConnector({
  calloutId,
  defaultDisplayName,
  defaultMarkdown,
  onCreated,
}: MemoContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const fallbackName = defaultDisplayName ?? t('callout.defaultMemoName');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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
      <ContributionAddCard label={t('callout.addMemo')} icon={StickyNote} onClick={handleOpenCreate} />
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
