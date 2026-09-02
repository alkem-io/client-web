import { useTranslation } from 'react-i18next';
import { AdminSearchableTable, type AdminTableColumn } from '@/crd/components/admin/AdminSearchableTable';
import { AccountOwnerCell } from '@/crd/components/admin/columns/AccountOwnerCell';
import { ListedInStoreCell } from '@/crd/components/admin/columns/ListedInStoreCell';
import { SearchVisibilityCell } from '@/crd/components/admin/columns/SearchVisibilityCell';
import { useAdminListSearch } from '../useAdminListSearch';
import type { AdminStoreEntityRow } from './storeEntityRow';

type StoreEntityListProps = {
  rows: AdminStoreEntityRow[];
  loading: boolean;
  /** Omit for read-only sections (Virtual Contributors). */
  onDelete?: (row: AdminStoreEntityRow) => void;
};

/**
 * Shared list body for the store-listable admin sections (Innovation Packs,
 * Innovation Hubs, Virtual Contributors). Identical columns + client-side
 * search/pagination; only the data + delete differ per section.
 */
export function StoreEntityList({ rows, loading, onDelete }: StoreEntityListProps) {
  const { t } = useTranslation('crd-admin');
  const { searchTerm, onSearchTermChange, filteredRows } = useAdminListSearch(rows);

  const columns: AdminTableColumn<AdminStoreEntityRow>[] = [
    { header: t('columns.listedHeader'), render: row => <ListedInStoreCell listed={row.listedInStore} /> },
    {
      header: t('columns.visibilityHeader'),
      render: row => <SearchVisibilityCell visibility={row.searchVisibility} />,
    },
    { header: t('columns.ownerHeader'), render: row => <AccountOwnerCell owner={row.accountOwner} /> },
  ];

  return (
    <AdminSearchableTable<AdminStoreEntityRow>
      rows={filteredRows}
      columns={columns}
      loading={loading}
      searchTerm={searchTerm}
      onSearchTermChange={onSearchTermChange}
      paginationMode="client"
      pageSize={10}
      onDelete={onDelete}
    />
  );
}
