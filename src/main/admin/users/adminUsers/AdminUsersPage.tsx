import React, { FC, useState } from 'react';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import useAdminGlobalUserList from '@/domain/platformAdmin/domain/users/useAdminGlobalUserList';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import { SearchableListItem } from '@/domain/shared/components/SearchableList/SimpleSearchableTable';
import { IconButton } from '@mui/material';
import { TuneOutlined } from '@mui/icons-material';
import LicensePlanDialog from '@/domain/platformAdmin/domain/organizations/LicensePlanDialog';
import AdminSearchableTable from '@/domain/platformAdmin/components/AdminSearchableTable';

const AdminUsersPage: FC = () => {
  const { userList, licensePlans, ...listProps } = useAdminGlobalUserList();

  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchableListItem | undefined>(undefined);

  const onSettingsClick = (item: SearchableListItem) => {
    setSelectedItem(item);
    setLicenseDialogOpen(true);
  };

  const assignLicense = async (entityId: string, planId: string) => {
    await listProps.assignLicensePlan(entityId, planId);
    setLicenseDialogOpen(false);
  };

  const revokeLicense = async (entityId: string, planId: string) => {
    await listProps.revokeLicensePlan(entityId, planId);
    setLicenseDialogOpen(false);
  };

  const getActions = (item: SearchableListItem) => {
    return (
      <IconButton onClick={() => onSettingsClick(item)} size="large" aria-label={'License'}>
        <TuneOutlined />
      </IconButton>
    );
  };

  return (
    <AdminLayout currentTab={AdminSection.User}>
      <SearchableListLayout>
        <AdminSearchableTable data={userList} {...listProps} itemActions={getActions} />
      </SearchableListLayout>
      {selectedItem?.accountId && (
        <LicensePlanDialog
          open={licenseDialogOpen}
          accountId={selectedItem?.accountId}
          onClose={() => setLicenseDialogOpen(false)}
          licensePlans={licensePlans}
          assignLicensePlan={assignLicense}
          revokeLicensePlan={revokeLicense}
          activeLicensePlanIds={selectedItem.activeLicensePlanIds}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
