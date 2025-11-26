import { ChangeEvent, FC, useCallback, useId, MouseEvent } from 'react';
import { Alert, Box, IconButton, Switch, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';
import { UseWhiteboardGuestAccessResult } from '../hooks/useWhiteboardGuestAccess';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ParseKeys } from 'i18next';

export interface WhiteboardGuestAccessSectionProps {
  guestAccess: UseWhiteboardGuestAccessResult;
}

/**
 * Guest access section for whiteboard Share dialog.
 * Displays toggle switch and guest URL field.
 *
 * This component is rendered inside WhiteboardGuestAccessControls wrapper,
 * so it's only visible when user has PUBLIC_SHARE privilege.
 */
const WhiteboardGuestAccessSection: FC<WhiteboardGuestAccessSectionProps> = ({ guestAccess }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const guestAccessLabelId = useId();

  const handleToggleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!guestAccess.canToggle || guestAccess.isMutating) {
        return;
      }
      void Promise.resolve(guestAccess.onToggle(event.target.checked)).catch(() => undefined);
    },
    [guestAccess]
  );

  const handleCopyGuestLink = useCallback(async () => {
    if (!guestAccess?.guestLink) {
      return;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(guestAccess.guestLink);
      notify(t('share-dialog.platforms.clipboard.copied'), 'success');
    } catch {
      notify(t('share-dialog.guest-access.errors.UNKNOWN'), 'error');
    }
  }, [guestAccess?.guestLink, notify, t]);

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      marginTop={gutters(0.1)}
      gap={gutters(0.5)}
      width="100%"
      data-testid="guest-access-section"
    >
      {guestAccess.canToggle && (
        <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              id={guestAccessLabelId}
              color="text.primary"
              sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '20px' }}
            >
              {t('share-dialog.guest-access.label')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('share-dialog.guest-access.toggle-description')}
            </Typography>
          </Box>
          <Switch
            checked={guestAccess.enabled}
            onChange={handleToggleChange}
            color="primary"
            disabled={guestAccess.isMutating}
            inputProps={{
              'aria-label': t('share-dialog.guest-access.toggle-label'),
              'aria-labelledby': guestAccessLabelId,
            }}
          />
        </Box>
      )}
      {guestAccess.error && (
        <Alert
          severity="error"
          onClose={guestAccess.resetError}
          sx={{ width: '100%' }}
          data-testid="guest-access-error"
        >
          {t(`share-dialog.guest-access.errors.${guestAccess.error.code}` as ParseKeys)}
        </Alert>
      )}
      {guestAccess.enabled && (
        <Box display="flex" alignItems="center" width="100%" gap={gutters(0.5)} marginTop={gutters(0.5)}>
          <TextField
            variant="outlined"
            value={guestAccess.guestLink ?? ''}
            label={t('share-dialog.guest-access.url-label')}
            InputProps={{
              readOnly: true,
              onClick: handleClick,
              sx: { color: theme => theme.palette.neutralMedium.dark },
            }}
            fullWidth
            sx={{ flexGrow: 1 }}
          />
          <IconButton
            onClick={handleCopyGuestLink}
            edge="end"
            size="large"
            aria-label={t('share-dialog.guest-access.copy-url')}
            color="primary"
            sx={{
              borderRadius: '12px',
              padding: gutters(0.5),
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              marginRight: gutters(0.3),
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default WhiteboardGuestAccessSection;
