import { FC, useState } from 'react';
import { useResolvedPath } from 'react-router-dom';
import {
  useAdminInnovationPacksListQuery,
  useDeleteInnovationPackMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import SearchableListLayout from '../../../../../shared/components/SearchableListLayout';
import SimpleSearchableList from '../../../../../shared/components/SimpleSearchableList';
import AdminLayout from '../../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../../layout/toplevel/constants';

interface AdminInnovationPacksPageProps {
  dialog?: 'new';
}

const AdminInnovationPacksPage: FC<AdminInnovationPacksPageProps> = () => {
  const { pathname } = useResolvedPath('.');
  const { data, loading } = useAdminInnovationPacksListQuery();
  const [deleteInnovationPack] = useDeleteInnovationPackMutation();

  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (innovationPackId: string) =>
    await deleteInnovationPack({
      variables: {
        innovationPackId,
      },
    });

  const notPaginatedList = {
    data: data?.platform.library.innovationPacks.map(ip => ({
      value: ip.profile.displayName,
      url: `${pathname}/${ip.nameID}`,
      ...ip,
    })),
    onDelete: (item: { id: string }) => handleDelete(item.id),
    loading,
    fetchMore: () => Promise.resolve(),
    pageSize: data?.platform.library.innovationPacks.length ?? 0,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    hasMore: false,
  };

  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <SearchableListLayout newLink={`${pathname}/new`}>
        <SimpleSearchableList {...notPaginatedList} />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationPacksPage;
