import { ChangeEvent, FC, useCallback } from 'react';
import { Alert, Box, Switch, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { gutters } from '@/core/ui/grid/utils';
type GuestAccessError = {
  code: 'PERMISSION_DENIED' | 'NETWORK' | 'UNKNOWN' | string;
  message?: string;
};

export interface GuestAccessToggleProps {
  enabled: boolean;
  canToggle: boolean;
  isMutating: boolean;
  onToggle: (nextState: boolean) => Promise<void> | void;
  error?: GuestAccessError;
  resetError: () => void;
}

const GuestAccessToggle: FC<GuestAccessToggleProps> = ({
  enabled,
  canToggle,
  isMutating,
  onToggle,
  error,
  resetError,
}) => {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      if (!canToggle || isMutating) {
        return;
      }
      void Promise.resolve(onToggle(checked)).catch(() => undefined);
    },
    [canToggle, isMutating, onToggle]
  );

  const errorTranslationKey = (() => {
    if (!error) {
      return 'share-dialog.guest-access.errors.UNKNOWN' as const;
    }

    switch (error.code) {
      case 'PERMISSION_DENIED':
        return 'share-dialog.guest-access.errors.PERMISSION_DENIED' as const;
      case 'NETWORK':
        return 'share-dialog.guest-access.errors.NETWORK' as const;
      default:
        return 'share-dialog.guest-access.errors.UNKNOWN' as const;
    }
  })();

  return (
    <Box display="flex" flexDirection="column" gap={gutters(0.5)}>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={gutters(0.5)}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography component="span" variant="subtitle2">
            {t('share-dialog.guest-access.toggle-label')}
          </Typography>
          {!canToggle && (
            <Tooltip title={t('share-dialog.guest-access.disabled-tooltip')}>
              <InfoOutlinedIcon color="action" fontSize="small" />
            </Tooltip>
          )}
        </Box>
        <Switch
          checked={enabled}
          disabled={!canToggle || isMutating}
          onChange={handleChange}
          inputProps={{ 'aria-label': t('share-dialog.guest-access.toggle-label') }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {t('share-dialog.guest-access.toggle-description')}
      </Typography>
      {error && (
        <Alert severity="error" onClose={resetError} data-testid="guest-access-error">
          {t(errorTranslationKey)}
        </Alert>
      )}
    </Box>
  );
};

export default GuestAccessToggle;
