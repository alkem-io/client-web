import InnovationPackForm, { InnovationPackFormValues } from '../admin/InnovationPackForm'; // Assuming InnovationPackForm is in the same directory
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import { useCreateInnovationPackMutation } from '@/core/apollo/generated/apollo-hooks';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const CreateInnovationPackDialog = ({
  accountId,
  open = false,
  onClose,
}: {
  accountId: string | undefined;
  open: boolean | undefined;
  onClose?: () => void;
}) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;

  const [createInnovationPack, { loading }] = useCreateInnovationPackMutation();

  const handleSubmit = async (formData: InnovationPackFormValues) => {
    if (!accountId) {
      return;
    }
    await createInnovationPack({
      variables: {
        packData: {
          accountID: accountId,
          profileData: {
            displayName: formData.profile.displayName,
            description: formData.profile.description,
          },
        },
      },
      refetchQueries: ['AdminInnovationPacksList', 'AccountInformation', 'InnovationLibrary'],
      onCompleted: () => {
        notify(t('pages.admin.innovation-packs.notifications.pack-created'), 'success');
        onClose?.();
      },
      onError: () => {
        notify(t('pages.admin.innovation-packs.notifications.pack-error'), 'error');
      },
    });
  };

  if (!accountId || !userId) {
    return null;
  }

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} columns={6} aria-labelledby="create-innovation-pack-dialog-title">
        <DialogHeader onClose={onClose}>
          <BlockTitle id="create-innovation-pack-dialog-title">{t('pages.admin.innovation-packs.create')}</BlockTitle>
        </DialogHeader>
        <DialogContent>
          <StorageConfigContextProvider accountId={accountId} locationType="account">
            <InnovationPackForm isNew onSubmit={handleSubmit} loading={loading || !accountId} />
          </StorageConfigContextProvider>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default CreateInnovationPackDialog;
