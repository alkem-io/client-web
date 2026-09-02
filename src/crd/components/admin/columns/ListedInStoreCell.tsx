import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';

/**
 * Renders the "Listed in Store" column — a check/cross badge mirroring the MUI
 * `ListedInStoreColumn`.
 */
export function ListedInStoreCell({ listed }: { listed: boolean }) {
  const { t } = useTranslation('crd-admin');

  return (
    <Badge variant={listed ? 'secondary' : 'outline'} className="gap-1">
      {listed ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
      {listed ? t('columns.listed') : t('columns.notListed')}
    </Badge>
  );
}
