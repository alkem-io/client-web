import { FC, useMemo, useState } from 'react';
import { sortBy } from 'lodash';
import {
  refetchAdminInnovationPacksListQuery,
  useAdminInnovationPacksListQuery,
  useDeleteInnovationPackMutation,
} from '@core/apollo/generated/apollo-hooks';
import SearchableListLayout from '../../shared/components/SearchableList/SearchableListLayout';
import SimpleSearchableTable from '../../shared/components/SearchableList/SimpleSearchableTable';
import AdminLayout from '../../platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../platform/admin/layout/toplevel/constants';
import { buildInnovationPackSettingsUrl } from '@main/routing/urlBuilders';

interface AdminInnovationPacksPageProps {}

const AdminInnovationPacksPage: FC<AdminInnovationPacksPageProps> = () => {
  const { data, loading } = useAdminInnovationPacksListQuery();
  const [deleteInnovationPack] = useDeleteInnovationPackMutation({
    refetchQueries: [refetchAdminInnovationPacksListQuery()],
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (innovationPackId: string) =>
    await deleteInnovationPack({
      variables: {
        innovationPackId,
      },
    });

  const innovationPacks = useMemo(
    () =>
      sortBy(
        data?.platform.library.innovationPacks
          .map(pack => ({
            value: pack.profile.displayName,
            url: buildInnovationPackSettingsUrl(pack.profile.url),
            ...pack,
          }))
          .filter(ip => !searchTerm || ip.profile.displayName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1),
        ip => ip.profile.displayName.toLowerCase() // sortBy
      ),
    [data, searchTerm]
  );

  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <SearchableListLayout>
        <SimpleSearchableTable
          data={innovationPacks}
          onDelete={item => handleDelete(item.id)}
          loading={loading}
          fetchMore={() => Promise.resolve()}
          pageSize={data?.platform.library.innovationPacks.length ?? 0}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasMore={false}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationPacksPage;
