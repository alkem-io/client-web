import { useMemo, useState } from 'react';
import { sortBy } from 'lodash';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import {
  refetchPlatformAdminInnovationHubsQuery,
  usePlatformAdminInnovationHubsQuery,
  useDeleteInnovationHubMutation,
} from '@/core/apollo/generated/apollo-hooks';
import SimpleSearchableTable from '@/domain/shared/components/SearchableList/SimpleSearchableTable';

const AdminInnovationHubsPage = () => {
  const { data, loading } = usePlatformAdminInnovationHubsQuery();
  const [deleteInnovationHub] = useDeleteInnovationHubMutation({
    refetchQueries: [refetchPlatformAdminInnovationHubsQuery()],
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (innovationHubId: string) =>
    await deleteInnovationHub({
      variables: {
        innovationHubId,
      },
    });

  const innovationHubs = useMemo(
    () =>
      sortBy(
        data?.platformAdmin.innovationHubs
          .map(hub => ({
            value: hub.profile.displayName,
            url: hub.profile.url,
            ...hub,
          }))
          .filter(ip => !searchTerm || ip.profile.displayName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1),
        ip => ip.profile.displayName.toLowerCase() // sortBy
      ),
    [data, searchTerm]
  );

  return (
    <AdminLayout currentTab={AdminSection.InnovationHubs}>
      <SearchableListLayout>
        <SimpleSearchableTable
          data={innovationHubs}
          onDelete={item => handleDelete(item.id)}
          loading={loading}
          fetchMore={() => Promise.resolve()}
          pageSize={data?.platformAdmin.innovationHubs.length ?? 0}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasMore={false}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationHubsPage;
