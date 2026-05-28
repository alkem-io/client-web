import { Layers, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import { mapSubspacesToCardDataList } from '../../space/dataMappers/subspaceCardDataMapper';

type CrdSubspaceSubspacesDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The CURRENT subspace id — its children (L2) are shown in the dialog. */
  subspaceId: string | undefined;
  /** When provided, renders a "Create Subspace" button in the footer that
   *  invokes this callback. Owner of the create flow (the parent layout) gates
   *  this on `permissions.canCreateSubspace`, so the absence of the prop is the
   *  signal to hide the footer entirely. */
  onCreateSubspace?: () => void;
};

export function CrdSubspaceSubspacesDialogConnector({
  open,
  onOpenChange,
  subspaceId,
  onCreateSubspace,
}: CrdSubspaceSubspacesDialogConnectorProps) {
  const { t } = useTranslation(['crd-subspace', 'crd-space']);

  const { data } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: subspaceId ?? '' },
    skip: !open || !subspaceId,
  });

  const rawSubspaces = data?.lookup.space?.subspaces;
  const sortMode = data?.lookup.space?.settings.sortMode;
  const sorted = useSubspacesSorted(rawSubspaces, sortMode);
  const subspaces = mapSubspacesToCardDataList(sorted, sortMode);
  const hasSubspaces = subspaces.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0"
        closeLabel={t('crd-subspace:a11y.close')}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" aria-hidden="true" />
            {t('crd-subspace:subspaces.dialogTitle')}
          </DialogTitle>
          {!hasSubspaces && <DialogDescription className="py-2">{t('crd-subspace:subspaces.empty')}</DialogDescription>}
        </DialogHeader>

        {hasSubspaces && (
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <SpaceSubspacesList subspaces={subspaces} disableFilters={true} />
          </div>
        )}

        {onCreateSubspace && (
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button size="sm" className="gap-2" onClick={onCreateSubspace}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('crd-space:subspaces.createSubspace')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
