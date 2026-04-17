import { PenTool } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateWhiteboardOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

type WhiteboardContributionAddConnectorProps = {
  calloutId: string;
  defaultDisplayName?: string;
  defaultContent?: string;
  onCreated?: () => void;
};

export function WhiteboardContributionAddConnector({
  calloutId,
  defaultDisplayName,
  defaultContent,
  onCreated,
}: WhiteboardContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const fallbackName = defaultDisplayName ?? t('callout.defaultWhiteboardName');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [whiteboardName, setWhiteboardName] = useState(fallbackName);
  const [createWhiteboard] = useCreateWhiteboardOnCalloutMutation();

  const handleOpen = () => {
    setWhiteboardName(fallbackName);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const [handleCreate, creating] = useLoadingState(async () => {
    const trimmed = whiteboardName.trim();
    if (!trimmed) return;
    await createWhiteboard({
      variables: {
        calloutId,
        whiteboard: {
          profile: { displayName: trimmed },
          content: defaultContent ?? EmptyWhiteboardString,
        },
      },
      refetchQueries: ['CalloutContributions'],
      awaitRefetchQueries: true,
    });
    onCreated?.();
    handleClose();
  });

  return (
    <>
      <ContributionAddCard label={t('callout.addResponse')} icon={PenTool} onClick={handleOpen} />
      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-md" closeLabel={t('a11y.close')}>
          <DialogHeader>
            <DialogTitle>{t('callout.createWhiteboard')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor="crd-create-whiteboard-name" className="text-xs text-muted-foreground">
              {t('callout.whiteboardNameLabel')}
            </label>
            <Input
              id="crd-create-whiteboard-name"
              value={whiteboardName}
              onChange={e => setWhiteboardName(e.target.value)}
              autoFocus={true}
              disabled={creating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={creating}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!whiteboardName.trim() || creating} aria-busy={creating}>
              {t('dialogs.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
