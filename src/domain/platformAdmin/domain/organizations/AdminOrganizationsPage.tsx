import { useState } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import usePlatformAdminOrganizationsList from './usePlatformAdminOrganizationsList';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import { SearchableListItem } from '@/domain/shared/components/SearchableList/SimpleSearchableTable';
import { IconButton } from '@mui/material';
import { TuneOutlined, VerifiedUser, VerifiedUserOutlined } from '@mui/icons-material';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import LicensePlanDialog from './LicensePlanDialog';
import AdminSearchableTable from '@/domain/platformAdmin/components/AdminSearchableTable';

const AdminOrganizationsPage = () => {
  const { t } = useTranslation();
  const { organizations, licensePlans, ...listProps } = usePlatformAdminOrganizationsList();

  const { pathname: url } = useResolvedPath('.');

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchableListItem | undefined>(undefined);

  const onVerificationClick = (item: SearchableListItem) => {
    setConfirmationOpen(true);
    setSelectedItem(item);
  };

  const onCloseConfirmation = () => {
    setConfirmationOpen(false);
    setSelectedItem(undefined);
  };

  const onVerificationConfirmation = async () => {
    if (selectedItem) {
      setVerificationLoading(true);
      await listProps.handleVerification(selectedItem);
      setVerificationLoading(false);
      onCloseConfirmation();
    }
  };

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
      <>
        <IconButton onClick={() => onSettingsClick(item)} size="large" aria-label={'License'}>
          <TuneOutlined />
        </IconButton>
        <IconButton onClick={() => onVerificationClick(item)} size="large" aria-label={'Verify'}>
          {item?.verified ? <VerifiedUser color="success" /> : <VerifiedUserOutlined />}
        </IconButton>
      </>
    );
  };

  const getStatusTranslation = (item: SearchableListItem | undefined) => {
    switch (item?.verified) {
      case true:
        return t('pages.admin.organization.verification.confirm.status.verified');
      default:
        return t('pages.admin.organization.verification.confirm.status.notVerified');
    }
  };

  const getActionTranslation = (item: SearchableListItem | undefined) => {
    switch (item?.verified) {
      case true:
        return t('pages.admin.organization.verification.confirm.action.unverify');
      default:
        return t('pages.admin.organization.verification.confirm.action.verify');
    }
  };

  return (
    <AdminLayout currentTab={AdminSection.Organization}>
      <SearchableListLayout newLink={`${url}/new`}>
        <AdminSearchableTable data={organizations} {...listProps} itemActions={getActions} />
      </SearchableListLayout>
      <ConfirmationDialog
        actions={{
          onConfirm: onVerificationConfirmation,
          onCancel: onCloseConfirmation,
        }}
        options={{
          show: confirmationOpen,
        }}
        state={{
          isLoading: verificationLoading,
        }}
        entities={{
          title: t('pages.admin.organization.verification.confirm.title', {
            action: getActionTranslation(selectedItem),
            name: selectedItem?.value,
          }),
          content: t('pages.admin.organization.verification.confirm.description', {
            status: getStatusTranslation(selectedItem),
            action: getActionTranslation(selectedItem).toLowerCase(),
          }),
          confirmButtonText: getActionTranslation(selectedItem),
        }}
      />
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

export default AdminOrganizationsPage;
