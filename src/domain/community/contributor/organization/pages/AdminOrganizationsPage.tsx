import React, { FC } from 'react';
import AdminLayout from '../../../../platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../../../platform/admin/layout/toplevel/constants';
import useAdminGlobalOrganizationsList from '../../../../platform/admin/organization/GlobalOrganizationsList/useAdminGlobalOrganizationsList';
import SearchableListLayout from '../../../../shared/components/SearchableList/SearchableListLayout';
import { useResolvedPath } from 'react-router-dom';
import SimpleSearchableList from '../../../../shared/components/SearchableList/SimpleSearchableList';
import useRelativeUrls from '../../../../platform/admin/utils/useRelativeUrls';

const AdminOrganizationsPage: FC = () => {
  const { organizations, ...listProps } = useAdminGlobalOrganizationsList();

  const { pathname: url } = useResolvedPath('.');

  const navigatableOrganizations = useRelativeUrls(organizations);

  return (
    <AdminLayout currentTab={AdminSection.Organization}>
      <SearchableListLayout newLink={`${url}/new`}>
        <SimpleSearchableList data={navigatableOrganizations} {...listProps} />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminOrganizationsPage;
