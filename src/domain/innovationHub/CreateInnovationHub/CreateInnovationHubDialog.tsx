import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import InnovationHubForm, { InnovationHubFormValues } from '../InnovationHubsSettings/InnovationHubForm';
import { useCreateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import { InnovationHubType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useEnsurePresence from '@/core/utils/ensurePresence';

type CreateInnovationHubDialogProps = {
  accountId: string | undefined;
  open: boolean | undefined;
  onClose?: () => void;
};

const CreateInnovationHubDialog = ({ accountId, open = false, onClose }: CreateInnovationHubDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const ensurePresence = useEnsurePresence();

  const [createInnovationHub, { loading }] = useCreateInnovationHubMutation();

  const handleSubmit = async (formData: InnovationHubFormValues) => {
    const requiredAccountId = ensurePresence(accountId);

    await createInnovationHub({
      variables: {
        hubData: {
          accountID: requiredAccountId,
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

  if (!accountId) {
    return null;
  }

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} columns={6} aria-labelledby="create-innovation-hub">
        <DialogHeader id="create-innovation-hub" onClose={onClose}>
          <BlockTitle>{t('pages.admin.innovationHubs.create')}</BlockTitle>
        </DialogHeader>
        <DialogContent>
          <StorageConfigContextProvider accountId={accountId} locationType="account">
            <InnovationHubForm isNew onSubmit={handleSubmit} loading={loading} />
          </StorageConfigContextProvider>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default CreateInnovationHubDialog;
