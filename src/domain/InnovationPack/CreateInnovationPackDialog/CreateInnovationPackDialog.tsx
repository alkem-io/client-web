import { useState } from 'react';
import InnovationPackForm, { InnovationPackFormValues } from '../admin/InnovationPackForm'; // Assuming InnovationPackForm is in the same directory
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useTranslation } from 'react-i18next';
import { DialogContent, IconButton } from '@mui/material';
import { useCreateInnovationPackMutation } from '@/core/apollo/generated/apollo-hooks';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import AddIcon from '@mui/icons-material/Add';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';

const CreateInnovationPackDialog = ({ accountId }: { accountId: string | undefined }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [createInnovationPack, { loading }] = useCreateInnovationPackMutation();

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
      refetchQueries: ['AdminInnovationPacksList', 'AccountInformation', 'InnovationLibrary'],
    });
    if (data?.createInnovationPack.nameID) {
      setIsOpen(false);
    }
  };

  if (!accountId) {
    return null;
  }

  return (
    <>
      <DialogWithGrid open={isOpen} onClose={() => setIsOpen(false)} columns={6}>
        <DialogHeader onClose={() => setIsOpen(false)}>
          <BlockTitle>{t('pages.admin.innovation-packs.create')}</BlockTitle>
        </DialogHeader>
        <DialogContent>
          <InnovationPackForm isNew onSubmit={handleSubmit} loading={loading || !accountId} />
        </DialogContent>
      </DialogWithGrid>
      <IconButton aria-label={t('common.add')} aria-haspopup="true" size="small" onClick={() => setIsOpen(true)}>
        <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
      </IconButton>
    </>
  );
};

export default CreateInnovationPackDialog;
