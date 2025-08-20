import { useMemo, useState } from 'react';
import { sortBy } from 'lodash';
import {
  refetchPlatformAdminInnovationPacksQuery,
  usePlatformAdminInnovationPacksQuery,
  useDeleteInnovationPackMutation,
} from '@/core/apollo/generated/apollo-hooks';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import SimpleSearchableTable from '@/domain/shared/components/SearchableList/SimpleSearchableTable';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';

const AdminInnovationPacksPage = () => {
  const { data, loading } = usePlatformAdminInnovationPacksQuery();
  const [deleteInnovationPack] = useDeleteInnovationPackMutation({
    refetchQueries: [refetchPlatformAdminInnovationPacksQuery()],
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
        data?.platformAdmin.innovationPacks
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
          pageSize={data?.platformAdmin.innovationPacks.length ?? 0}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasMore={false}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationPacksPage;
