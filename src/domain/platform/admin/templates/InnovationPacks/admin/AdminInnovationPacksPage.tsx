import { FC, useMemo, useState } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { sortBy } from 'lodash';
import {
  refetchAdminInnovationPacksListQuery,
  useAdminInnovationPacksListQuery,
  useDeleteInnovationPackMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import SearchableListLayout from '../../../../../shared/components/SearchableListLayout';
import SimpleSearchableList from '../../../../../shared/components/SimpleSearchableList';
import AdminLayout from '../../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../../layout/toplevel/constants';

interface AdminInnovationPacksPageProps {}

const AdminInnovationPacksPage: FC<AdminInnovationPacksPageProps> = () => {
  const { pathname } = useResolvedPath('.');
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
          .map(ip => ({
            value: ip.profile.displayName,
            url: `${pathname}/${ip.nameID}`,
            ...ip,
          }))
          .filter(ip => !searchTerm || ip.profile.displayName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1),
        ip => ip.profile.displayName.toLowerCase() // sortBy
      ),
    [data, searchTerm]
  );

  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <SearchableListLayout newLink={`${pathname}/new`}>
        <SimpleSearchableList
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
