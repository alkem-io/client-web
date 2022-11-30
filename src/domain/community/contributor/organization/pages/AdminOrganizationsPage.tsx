import React, { FC } from 'react';
import AdminLayout from '../../../../platform/admin/toplevel/AdminLayout';
import { PageProps } from '../../../../shared/types/PageProps';
import { AdminSection } from '../../../../platform/admin/toplevel/constants';
import useAdminGlobalOrganizationsList from '../../../../platform/admin/organization/GlobalOrganizationsList/useAdminGlobalOrganizationsList';
import SearchableListLayout from '../../../../shared/components/SearchableListLayout';
import { useResolvedPath } from 'react-router-dom';
import SimpleSearchableList from '../../../../shared/components/SimpleSearchableList';
import { useUpdateNavigation } from '../../../../../hooks';

interface AdminOrganizationsPageProps extends PageProps {}

const AdminOrganizationsPage: FC<AdminOrganizationsPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { organizations, ...listProps } = useAdminGlobalOrganizationsList();

  const { pathname: url } = useResolvedPath('.');

  return (
    <AdminLayout currentTab={AdminSection.Organization}>
      <SearchableListLayout newLink={`${url}/new`}>
        <SimpleSearchableList data={organizations} {...listProps} />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminOrganizationsPage;
