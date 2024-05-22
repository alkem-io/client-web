import React, { FC } from 'react';
import AdminLayout from '../../../../platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../../../platform/admin/layout/toplevel/constants';
import useAdminGlobalOrganizationsList from './useAdminGlobalOrganizationsList';
import SearchableListLayout from '../../../../shared/components/SearchableList/SearchableListLayout';
import { useResolvedPath } from 'react-router-dom';
import SimpleSearchableList from '../../../../shared/components/SearchableList/SimpleSearchableList';

const AdminOrganizationsPage: FC = () => {
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
