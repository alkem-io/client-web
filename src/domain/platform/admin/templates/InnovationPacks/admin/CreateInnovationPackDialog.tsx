import React, { useMemo, useState } from 'react';
import InnovationPackForm, { InnovationPackFormValues } from './InnovationPackForm'; // Assuming InnovationPackForm is in the same directory
import DialogWithGrid from '../../../../../../core/ui/dialog/DialogWithGrid';
import { useTranslation } from 'react-i18next';
import { DialogContent, IconButton } from '@mui/material';
import {
  refetchAdminInnovationPacksListQuery,
  refetchUserAccountQuery,
  useCreateInnovationPackMutation,
  useOrganizationsListQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { sortBy } from 'lodash';
import DialogHeader from '../../../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../../../core/ui/typography';
import AddIcon from '@mui/icons-material/Add';
import RoundedIcon from '../../../../../../core/ui/icon/RoundedIcon';

interface CreateInnovationPackDialogProps {
  accountId: string | undefined;
}

const CreateInnovationPackDialog = ({ accountId }: CreateInnovationPackDialogProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { data: organizationsList, loading: loadingOrganizations } = useOrganizationsListQuery({
    skip: !isOpen,
  });

  const organizations = useMemo(
    () =>
      sortBy(
        organizationsList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
        org => org.name
      ),
    [organizationsList]
  );

  const [createInnovationPack, { loading: creating }] = useCreateInnovationPackMutation();

  const handleSubmit = async (formData: InnovationPackFormValues) => {
    if (!accountId) {
      return;
    }
    const { data } = await createInnovationPack({
      variables: {
        packData: {
          accountID: accountId,
          nameID: formData.nameID,
          profileData: {
            displayName: formData.profile.displayName,
            description: formData.profile.description,
          },
        },
      },
      refetchQueries: [refetchAdminInnovationPacksListQuery(), refetchUserAccountQuery()],
    });
    if (data?.createInnovationPack.nameID) {
      setIsOpen(false);
    }
  };

  if (!accountId) {
    return null;
  }

  const loading = loadingOrganizations || creating;

  return (
    <>
      <DialogWithGrid open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogHeader onClose={() => setIsOpen(false)}>
          <BlockTitle>{t('pages.admin.innovation-packs.create')}</BlockTitle>
        </DialogHeader>
        <DialogContent>
          <InnovationPackForm
            isNew
            organizations={organizations}
            onSubmit={handleSubmit}
            loading={loading || !accountId}
          />
        </DialogContent>
      </DialogWithGrid>
      <IconButton aria-label={t('common.add')} aria-haspopup="true" size="small" onClick={() => setIsOpen(true)}>
        <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
      </IconButton>
    </>
  );
};

export default CreateInnovationPackDialog;
