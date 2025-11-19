import { FC, useCallback } from 'react';
import { Alert, AlertTitle, Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';
import GuestAccessToggle from '@/domain/shared/components/ShareDialog/GuestAccessToggle';
import { UseWhiteboardGuestAccessResult } from '../hooks/useWhiteboardGuestAccess';
import { useNotification } from '@/core/ui/notifications/useNotification';

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
      notify(t('share-dialog.guestAccess.errors.UNKNOWN'), 'error');
    }
  }, [guestAccess?.guestLink, notify, t]);

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const shouldRenderDetails = Boolean(guestAccess.enabled);

  return (
    <Box display="flex" flexDirection="column" gap={gutters(1)} data-testid="guest-access-section">
      <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
        <Typography color="text.primary" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
          {t('share-dialog.guestAccess.sectionTitle')}
        </Typography>
      </Box>

      <GuestAccessToggle
        enabled={guestAccess.enabled}
        canToggle={guestAccess.canToggle}
        isMutating={guestAccess.isMutating}
        onToggle={guestAccess.onToggle}
        error={guestAccess.error}
        resetError={guestAccess.resetError}
      />

      {shouldRenderDetails && (
        <Box display="flex" flexDirection="column" gap={gutters(1)}>
          <Box display="flex" alignItems="center" width="100%" gap={gutters(0.5)}>
            <TextField
              variant="outlined"
              value={guestAccess.guestLink ?? ''}
              label={t('share-dialog.guestAccess.linkLabel')}
              InputProps={{
                readOnly: true,
                onClick: handleClick,
                endAdornment:
                  guestAccess?.guestLink && typeof navigator !== 'undefined' ? (
                    <Tooltip title={t('share-dialog.guestAccess.copyLabel')}>
                      <IconButton
                        onClick={handleCopyGuestLink}
                        edge="end"
                        size="small"
                        aria-label={t('share-dialog.guestAccess.copyLabel')}
                        sx={{
                          borderRadius: '12px',
                          padding: gutters(0.25),
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : undefined,
                sx: { color: theme => theme.palette.neutralMedium.dark },
              }}
              fullWidth
              sx={{ flexGrow: 1 }}
            />
          </Box>
          <Alert severity="warning" role="alert">
            <AlertTitle>{t('share-dialog.guestAccess.warningTitle')}</AlertTitle>
            {t('share-dialog.guestAccess.warningDescription')}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default WhiteboardGuestAccessSection;
