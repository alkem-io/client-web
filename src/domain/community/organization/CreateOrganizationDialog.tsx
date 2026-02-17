import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Box, DialogContent, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import OrganizationForm from '@/domain/platformAdmin/components/Organization/OrganizationForm';
import LightweightOrganizationForm from './LightweightOrganizationForm';
import { EditMode } from '@/core/ui/forms/editMode';
import { useCreateOrganizationMutation } from '@/core/apollo/generated/apollo-hooks';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { CreateOrganizationInput, UpdateOrganizationInput } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Caption } from '@/core/ui/typography';

export interface CreateOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
}

type OrganizationType = 'lightweight' | 'verified';

export const CreateOrganizationDialog = ({ open, onClose }: CreateOrganizationDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const [organizationType, setOrganizationType] = useState<OrganizationType>('lightweight');

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: data => {
      const organizationURL = data.createOrganization.profile.url;

      notify(t('pages.admin.organization.notifications.organization-created'), 'success');
      navigate(organizationURL);
    },
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
  });

  const handleSubmit = async (editedOrganization: CreateOrganizationInput | UpdateOrganizationInput): Promise<unknown> => {
    const { nameID, profileData } = editedOrganization as CreateOrganizationInput;

    const input: CreateOrganizationInput = {
      nameID,
      profileData: {
        displayName: profileData.displayName,
        tagline: profileData.tagline,
        description: profileData.description,
      },
    };

    return createOrganization({ variables: { input } });
  };

  const handleTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: OrganizationType | null) => {
    if (newType !== null) {
      setOrganizationType(newType);
    }
  };

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={6} aria-labelledby="create-organization-dialog">
      <DialogHeader
        id="create-organization-dialog"
        title={t('common.create-new-entity', { entity: t('common.organization') })}
        onClose={onClose}
      />

      <DialogContent>
        <Gutters disableGap disablePadding>
          <Box sx={{ mb: 3 }}>
            <Caption sx={{ mb: 1, display: 'block' }}>
              {t('components.organization.create.typeSelection.label')}
            </Caption>
            <ToggleButtonGroup
              value={organizationType}
              exclusive
              onChange={handleTypeChange}
              aria-label={t('components.organization.create.typeSelection.label')}
              fullWidth
            >
              <ToggleButton value="lightweight" aria-label={t('components.organization.create.typeSelection.lightweight')}>
                <Box sx={{ textAlign: 'left', py: 1 }}>
                  <Box sx={{ fontWeight: 600 }}>
                    {t('components.organization.create.typeSelection.lightweight')}
                  </Box>
                  <Caption>{t('components.organization.create.typeSelection.lightweightDescription')}</Caption>
                </Box>
              </ToggleButton>
              <ToggleButton value="verified" aria-label={t('components.organization.create.typeSelection.verified')}>
                <Box sx={{ textAlign: 'left', py: 1 }}>
                  <Box sx={{ fontWeight: 600 }}>
                    {t('components.organization.create.typeSelection.verified')}
                  </Box>
                  <Caption>{t('components.organization.create.typeSelection.verifiedDescription')}</Caption>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {organizationType === 'lightweight' ? (
            <LightweightOrganizationForm onSave={handleSubmit} onBack={onClose} />
          ) : (
            <OrganizationForm editMode={EditMode.new} onSave={handleSubmit} onBack={onClose} />
          )}
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};
