import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';

/**
 * Renders the "Search Visibility" column — a coloured badge (Public / Internal)
 * mirroring the MUI `SearchVisibilityColumn`.
 */
export function SearchVisibilityCell({ visibility }: { visibility: 'public' | 'internal' }) {
  const { t } = useTranslation('crd-admin');

  return (
    <Badge variant={visibility === 'public' ? 'default' : 'secondary'}>
      {visibility === 'public' ? t('columns.public') : t('columns.internal')}
    </Badge>
  );
}
