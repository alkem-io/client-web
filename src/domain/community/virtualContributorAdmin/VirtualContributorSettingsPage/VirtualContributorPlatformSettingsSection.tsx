import { Switch, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUpdateVirtualContributorPlatformSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { VirtualContributorPlatformSettings } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { BlockTitle } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { Button, CircularProgress } from '@mui/material';

interface VirtualContributorPlatformSettingsSectionProps {
  vc: {
    id: string;
    platformSettings?: VirtualContributorPlatformSettings | null;
  };
}

const VirtualContributorPlatformSettingsSection = ({ vc }: VirtualContributorPlatformSettingsSectionProps) => {
  const { t } = useTranslation();
  const [updateSettings, { loading }] = useUpdateVirtualContributorPlatformSettingsMutation();

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    updateSettings({
      variables: {
        settingsData: {
          virtualContributorID: vc.id,
          settings: {
            promptGraphEditingEnabled: nextValue,
          },
        },
      },
    });
  };

  return (
    <PageContentBlockSeamless>
      <BlockTitle>{t('pages.virtualContributorProfile.settings.title')}</BlockTitle>
      <FormControlLabel
        control={
          <Switch
            checked={vc.platformSettings?.promptGraphEditingEnabled ?? false}
            onChange={handleToggleChange}
            color="primary"
            disabled={loading}
          />
        }
        label={t('pages.virtualContributorProfile.settings.promptGraph.editingEnabledLabel')}
      />
      <Actions padding={gutters()}>
        <Button variant="contained" loading={loading} disabled>
          {loading ? <CircularProgress size={20} /> : t('buttons.save')}
        </Button>
      </Actions>
    </PageContentBlockSeamless>
  );
};

export default VirtualContributorPlatformSettingsSection;
