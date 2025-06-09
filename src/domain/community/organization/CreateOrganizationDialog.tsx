import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { DialogContent } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import OrganizationForm from '@/domain/platform/admin/components/Organization/OrganizationForm';
import { EditMode } from '@/core/ui/forms/editMode';
import { useCreateOrganizationMutation } from '@/core/apollo/generated/apollo-hooks';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { CreateOrganizationInput, UpdateOrganizationInput } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';

export interface CreateOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateOrganizationDialog = ({ open, onClose }: CreateOrganizationDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: data => {
      const organizationURL = data.createOrganization.profile.url;

      notify(t('pages.admin.organization.notifications.organization-created'), 'success');
      navigate(organizationURL);
    },
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
  });

  const handleSubmit = async (
    editedOrganization: CreateOrganizationInput | UpdateOrganizationInput
  ): Promise<unknown> => {
    const { nameID, profileData } = editedOrganization as CreateOrganizationInput;

    const input: CreateOrganizationInput = {
      nameID,
      profileData: {
        displayName: profileData.displayName,
      },
    };

    return createOrganization({ variables: { input } });
  };

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={6}>
      <DialogHeader title={t('common.create-new-entity', { entity: t('common.organization') })} onClose={onClose} />

      <DialogContent>
        <Gutters disableGap disablePadding sx={{ display: 'flex' }}>
          <OrganizationForm editMode={EditMode.new} onSave={handleSubmit} />
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};
