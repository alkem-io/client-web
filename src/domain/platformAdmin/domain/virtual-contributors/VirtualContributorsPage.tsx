import React, { FC, useMemo, useState } from 'react';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import { usePlatformAdminVirtualContributorsListQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import AdminSearchableTable, { AdminTableColumn } from '@/domain/platformAdmin/components/AdminSearchableTable';
import {
  ListedInStoreColumn,
  SearchVisibilityColumn,
  AccountOwnerColumn,
} from '@/domain/platformAdmin/components/AdminListItemLayout';
import { VirtualContributorTableItem } from '@/domain/platformAdmin/types/AdminTableItems';

const INITIAL_PAGE_SIZE = 10;
const PAGE_SIZE = 10;

const VirtualContributorsPage: FC = () => {
  const { data, loading } = usePlatformAdminVirtualContributorsListQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const columns: AdminTableColumn<VirtualContributorTableItem>[] = useMemo(
    () => [
      {
        header: 'Listed in Store',
        flex: 1,
        minWidth: '140px',
        render: (item: VirtualContributorTableItem) => <ListedInStoreColumn listedInStore={item.listedInStore} />,
      },
      {
        header: 'Search Visibility',
        flex: 1,
        minWidth: '140px',
        render: (item: VirtualContributorTableItem) => (
          <SearchVisibilityColumn searchVisibility={item.searchVisibility} />
        ),
      },
      {
        header: 'Account Owner',
        flex: 1,
        minWidth: '150px',
        render: (item: VirtualContributorTableItem) => <AccountOwnerColumn accountOwner={item.accountOwner} />,
      },
    ],
    []
  );

  const allVirtualContributors = useMemo(() => {
    const vcs = data?.platformAdmin.virtualContributors ?? [];

    return vcs
      .map(vc => {
        const accountOwner = vc.account?.host?.profile?.displayName || 'N/A';

        return {
          id: vc.id,
          value: vc.profile.displayName,
          url: vc.profile.url,
          listedInStore: vc.listedInStore,
          searchVisibility: vc.searchVisibility,
          accountOwner,
        } as VirtualContributorTableItem;
      })
      .filter(vc => !searchTerm || vc.value.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  if (loading) return <Loading text={'Loading virtual contributors'} />;

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <SearchableListLayout>
        <AdminSearchableTable
          data={allVirtualContributors}
          columns={columns}
          loading={false}
          pageSize={PAGE_SIZE}
          firstPageSize={INITIAL_PAGE_SIZE}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          totalCount={allVirtualContributors.length}
          clientSide
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default VirtualContributorsPage;
