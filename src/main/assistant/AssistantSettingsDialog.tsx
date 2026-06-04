import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePlatformCapabilitiesQuery, useUserAssistantSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { gutters } from '@/core/ui/grid/utils';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { UserAssistantTabView } from '@/crd/components/user/settings/UserAssistantTabView';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import {
  mapAssistantCapabilities,
  type PlatformCapability,
} from '@/main/crdPages/topLevelPages/userPages/settings/assistant/assistantCapabilitiesMapper';
import useUserAssistantTabData from '@/main/crdPages/topLevelPages/userPages/settings/assistant/useUserAssistantTabData';

/**
 * Quick-access assistant settings, opened from the assistant panel header — the
 * "general access" settings for now (the per-capability grant of what the
 * assistant may do on the user's behalf).
 *
 * Reuses the EXACT data layer + presentational view of the User → Settings →
 * Assistant tab (`CrdUserAssistantTab`), so the grant edited here is the same
 * one shown in settings (`platformCapabilities` enumerates the toggles;
 * `updateUserSettings({ assistant })` persists them). Rendered as a MUI dialog
 * because the panel is MUI — MUI's modal manager stacks it above the panel,
 * which a CRD/Radix dialog (z-50) would not. The CRD view is wrapped in a
 * `.crd-root` scope so its Tailwind preflight/tokens apply (the established
 * convention for CRD content inside a MUI dialog).
 */
const AssistantSettingsContent = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;

  const { data: capabilitiesData, loading: capabilitiesLoading } = usePlatformCapabilitiesQuery({
    fetchPolicy: 'cache-and-network',
  });
  const { data: settingsData, loading: settingsLoading } = useUserAssistantSettingsQuery({
    variables: { userId: userId ?? '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const capabilities: PlatformCapability[] = capabilitiesData?.platformCapabilities ?? [];
  const storedToggles = settingsData?.user.settings.assistant.enabledCapabilities ?? [];

  const { overrides, onToggle } = useUserAssistantTabData({ userId, capabilities, storedToggles });
  const rows = mapAssistantCapabilities(capabilities, storedToggles, overrides);

  const handleToggle = async (capabilityName: string, next: boolean) => {
    try {
      await onToggle(capabilityName, next);
    } catch {
      notify(t('user.assistant.toggleError'), 'error');
    }
  };

  const loading = (capabilitiesLoading && !capabilitiesData) || (settingsLoading && !settingsData);

  return <UserAssistantTabView loading={loading} capabilities={rows} onToggle={handleToggle} />;
};

const AssistantSettingsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="sm" aria-labelledby="assistant-settings-title">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding={gutters(0.5)}
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Typography id="assistant-settings-title" variant="h6">
          {t('assistant.settings')}
        </Typography>
        <IconButton onClick={onClose} aria-label={t('assistant.closeButton')}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        {/* CRD content inside a MUI dialog → scope it so Tailwind preflight/tokens apply. */}
        <div className="crd-root">{open ? <AssistantSettingsContent /> : null}</div>
      </DialogContent>
    </Dialog>
  );
};

export default AssistantSettingsDialog;
