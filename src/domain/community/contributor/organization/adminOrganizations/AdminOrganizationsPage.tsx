import React, { FC, useState } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../../platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../../../platform/admin/layout/toplevel/constants';
import useAdminGlobalOrganizationsList from './useAdminGlobalOrganizationsList';
import SearchableListLayout from '../../../../shared/components/SearchableList/SearchableListLayout';
import SimpleSearchableTable, {
  SearchableListItem,
} from '../../../../shared/components/SearchableList/SimpleSearchableTable';
import { IconButton } from '@mui/material';
import { TuneOutlined, VerifiedUserOutlined } from '@mui/icons-material';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';

const AdminOrganizationsPage: FC = () => {
  const { t } = useTranslation();
  const { organizations, ...listProps } = useAdminGlobalOrganizationsList();

  const { pathname: url } = useResolvedPath('.');

  const [confirmationOpen, setConfirmationOpen] = useState(false);
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
    // todo: implement assign license
  };

  const orgActions = (item: SearchableListItem) => {
    return (
      <>
        <IconButton onClick={() => onSettingsClick(item)} size="large" disabled aria-label={'License'}>
          <TuneOutlined />
        </IconButton>
        <IconButton onClick={() => onVerificationClick(item)} size="large" aria-label={'Verify'}>
          <VerifiedUserOutlined sx={{ color: item?.verified ? 'green' : '' }} />
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
        <SimpleSearchableTable data={organizations} {...listProps} itemActions={orgActions} />
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
    </AdminLayout>
  );
};

export default AdminOrganizationsPage;
