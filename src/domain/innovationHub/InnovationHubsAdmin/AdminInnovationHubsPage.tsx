import { FC, useMemo, useState } from 'react';
import { sortBy } from 'lodash';
import AdminLayout from '../../platform/admin/layout/toplevel/AdminLayout';
import SearchableListLayout from '../../shared/components/SearchableList/SearchableListLayout';
import { AdminSection } from '../../platform/admin/layout/toplevel/constants';
import {
  refetchAdminInnovationHubsListQuery,
  useAdminInnovationHubsListQuery,
  useDeleteInnovationHubMutation,
} from '@/core/apollo/generated/apollo-hooks';
import SimpleSearchableTable from '../../shared/components/SearchableList/SimpleSearchableTable';

interface AdminInnovationHubsPageProps {}

const AdminInnovationHubsPage: FC<AdminInnovationHubsPageProps> = () => {
  const { data, loading } = useAdminInnovationHubsListQuery();
  const [deleteInnovationHub] = useDeleteInnovationHubMutation({
    refetchQueries: [refetchAdminInnovationHubsListQuery()],
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
        data?.platform.library.innovationHubs
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
          pageSize={data?.platform.library.innovationHubs.length ?? 0}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasMore={false}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationHubsPage;
