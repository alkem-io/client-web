import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CreateSubspaceButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the create-subspace dialog. The consumer renders it only when the
 *  viewer has permission to create subspaces (FR-012). */
export function CreateSubspaceButton({ onClick, className }: CreateSubspaceButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button variant="outline" className={cn('w-full gap-2 text-body-emphasis', className)} onClick={onClick}>
      <Plus className="w-4 h-4" aria-hidden="true" />
      {t('subspaces.createSubspace')}
    </Button>
  );
}
