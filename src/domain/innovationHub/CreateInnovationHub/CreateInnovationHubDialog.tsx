import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import InnovationHubForm, { InnovationHubFormValues } from '../InnovationHubsAdmin/InnovationHubForm';
import { useCreateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import { InnovationHubType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUserContext } from '@/domain/community/user';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';

type CreateInnovationHubDialogProps = {
  accountId: string | undefined;
  accountHostName: string | undefined;
  open: boolean | undefined;
  onClose?: () => void;
};

const CreateInnovationHubDialog = ({
  accountId,
  accountHostName = '',
  open = false,
  onClose,
}: CreateInnovationHubDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { user } = useUserContext();
  const userId = user?.user.id;

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
        onClose?.();
      },
    });
  };

  if (!accountId || !userId) {
    return null;
  }

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} columns={6}>
        <DialogHeader onClose={onClose}>
          <BlockTitle>{t('pages.admin.innovationHubs.create')}</BlockTitle>
        </DialogHeader>
        <DialogContent>
          <StorageConfigContextProvider accountId={accountId} locationType="account">
            <InnovationHubForm
              isNew
              accounts={[{ id: accountId, name: accountHostName }]}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </StorageConfigContextProvider>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default CreateInnovationHubDialog;
