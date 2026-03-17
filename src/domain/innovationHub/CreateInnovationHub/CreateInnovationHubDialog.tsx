import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCreateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import { InnovationHubType } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle } from '@/core/ui/typography';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import InnovationHubForm, { type InnovationHubFormValues } from '../InnovationHubsSettings/InnovationHubForm';

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
    <DialogWithGrid open={open} onClose={onClose} columns={6} aria-labelledby="create-innovation-hub">
      <DialogHeader id="create-innovation-hub" onClose={onClose}>
        <BlockTitle>{t('pages.admin.innovationHubs.create')}</BlockTitle>
      </DialogHeader>
      <DialogContent>
        <StorageConfigContextProvider accountId={accountId} locationType="account">
          <InnovationHubForm isNew={true} onSubmit={handleSubmit} loading={loading} />
        </StorageConfigContextProvider>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CreateInnovationHubDialog;
