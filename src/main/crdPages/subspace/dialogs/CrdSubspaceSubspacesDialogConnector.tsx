import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import { mapSubspacesToCardDataList } from '../../space/dataMappers/subspaceCardDataMapper';

type CrdSubspaceSubspacesDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The CURRENT subspace id — its children (L2) are shown in the dialog. */
  subspaceId: string | undefined;
};

export function CrdSubspaceSubspacesDialogConnector({
  open,
  onOpenChange,
  subspaceId,
}: CrdSubspaceSubspacesDialogConnectorProps) {
  const { t } = useTranslation('crd-subspace');

  const { data } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: subspaceId ?? '' },
    skip: !open || !subspaceId,
  });

  const rawSubspaces = data?.lookup.space?.subspaces;
  const sortMode = data?.lookup.space?.settings.sortMode;
  const sorted = useSubspacesSorted(rawSubspaces, sortMode);
  const subspaces = mapSubspacesToCardDataList(sorted, sortMode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto" closeLabel={t('a11y.close')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" aria-hidden="true" />
            {t('subspaces.dialogTitle')}
          </DialogTitle>
          {subspaces.length === 0 && <DialogDescription className="py-2">{t('subspaces.empty')}</DialogDescription>}
        </DialogHeader>

        {subspaces.length > 0 && <SpaceSubspacesList subspaces={subspaces} />}
      </DialogContent>
    </Dialog>
  );
}
