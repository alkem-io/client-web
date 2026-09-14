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
import { mapSubspacesToCardDataList } from '../dataMappers/subspaceCardDataMapper';

type SubspacesDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The space whose direct children are listed — works for any level (L0/L1). */
  spaceId: string | undefined;
  /** Shown when the space has no subspaces — the consumer words it for its level. */
  emptyText: string;
  /** When provided, renders a "Create Subspace" button in the footer that
   *  invokes this callback. Owner of the create flow (the parent layout) gates
   *  this on the create-subspace privilege, so the absence of the prop is the
   *  signal to hide the footer entirely. */
  onCreateSubspace?: () => void;
};

export function SubspacesDialogConnector({
  open,
  onOpenChange,
  spaceId,
  emptyText,
  onCreateSubspace,
}: SubspacesDialogConnectorProps) {
  // crd-exploreSpaces is listed to preload it at mount (SpaceCard suspends on
  // it): with the dialog closed the suspension is absorbed by the page's
  // initial load instead of blanking the tab body on the first open.
  const { t } = useTranslation(['crd-space', 'crd-exploreSpaces']);

  const { data, loading } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !open || !spaceId,
  });

  const rawSubspaces = data?.lookup.space?.subspaces;
  const sortMode = data?.lookup.space?.settings.sortMode;
  const sorted = useSubspacesSorted(rawSubspaces, sortMode);
  const subspaces = mapSubspacesToCardDataList(sorted, sortMode);
  const hasSubspaces = subspaces.length > 0;
  const showEmptyText = !loading && !hasSubspaces;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0"
        closeLabel={t('a11y.close')}
        // DialogDescription only exists in the empty state; suppress Radix's
        // missing-description warning when the card grid renders instead.
        {...(showEmptyText ? {} : { 'aria-describedby': undefined })}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" aria-hidden="true" />
            {t('subspaces.title')}
          </DialogTitle>
          {showEmptyText && <DialogDescription className="py-2">{emptyText}</DialogDescription>}
        </DialogHeader>

        {hasSubspaces && (
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* The dialog IS the "show all" — render every card, no Show-more paging. */}
            <SpaceSubspacesList subspaces={subspaces} disableFilters={true} initialVisibleCount={subspaces.length} />
          </div>
        )}

        {onCreateSubspace && (
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button size="sm" className="gap-2" onClick={onCreateSubspace}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('subspaces.createSubspace')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
