import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import InnovationHubForm, { InnovationHubFormValues } from '../InnovationHubsAdmin/InnovationHubForm';
import { useCreateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import { InnovationHubType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';

interface CreateInnovationHubDialogProps {
  accountId: string | undefined;
  accountHostName: string | undefined;
}

const CreateInnovationHubDialog = ({ accountId, accountHostName = '' }: CreateInnovationHubDialogProps) => {
  const { t } = useTranslation();

  const notify = useNotification();

  const [isOpen, setIsOpen] = useState(false);

  const [createInnovationHub, { loading }] = useCreateInnovationHubMutation();

  const handleSubmit = async (formData: InnovationHubFormValues) => {
    await createInnovationHub({
      variables: {
        hubData: {
          accountID: formData.accountId,
          nameID: formData.nameID,
          subdomain: formData.subdomain,
          profileData: {
            displayName: formData.profile.displayName,
            tagline: formData.profile.tagline,
            description: formData.profile.description,
          },
          type: InnovationHubType.List,
          spaceListFilter: [],
        },
      },
      refetchQueries: ['AdminInnovationHubsList', 'AccountInformation'],
      onCompleted: () => {
        notify(t('pages.admin.innovationHubs.success'), 'success');
        setIsOpen(false);
      },
    });
  };

  if (!accountId) {
    return null;
  }

  return (
    <>
      <DialogWithGrid open={isOpen} onClose={() => setIsOpen(false)} columns={6}>
        <DialogHeader onClose={() => setIsOpen(false)}>
          <BlockTitle>{t('pages.admin.innovationHubs.create')}</BlockTitle>
        </DialogHeader>
        <DialogContent>
          <InnovationHubForm
            isNew
            accounts={[{ id: accountId, name: accountHostName }]}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </DialogContent>
      </DialogWithGrid>
      <IconButton aria-label={t('common.add')} aria-haspopup="true" size="small" onClick={() => setIsOpen(true)}>
        <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
      </IconButton>
    </>
  );
};

export default CreateInnovationHubDialog;
