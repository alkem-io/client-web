import { FC, useId, useState } from 'react';
import { Box, Switch, TextField, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';

export interface WhiteboardGuestAccessSectionProps {
  whiteboard?: {
    id?: string;
    nameID?: string;
  };
}

/**
 * Guest access section for whiteboard Share dialog.
 * Displays toggle switch and guest URL field.
 *
 * This component is rendered inside WhiteboardGuestAccessControls wrapper,
 * so it's only visible when user has PUBLIC_SHARE privilege.
 */
const WhiteboardGuestAccessSection: FC<WhiteboardGuestAccessSectionProps> = ({ whiteboard }) => {
  const { t } = useTranslation();
  const [guestAccessEnabled, setGuestAccessEnabled] = useState(false);
  const guestAccessLabelId = useId();

  // For now, using placeholder URL structure
  const guestUrl = whiteboard?.nameID ? `${window.location.origin}/guest/whiteboard/${whiteboard.nameID}` : '';

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGuestAccessEnabled(event.target.checked);
    // TODO: Call mutation to update whiteboard guest access setting
  };

  const handleCopyUrl = () => {
    if (guestUrl) {
      navigator.clipboard.writeText(guestUrl);
      // TODO: Close with success dialog (as other copy URL actions)
    }
  };

  const handleClick = e => {
    e.target.select();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      marginTop={gutters(-0.5)}
      gap={gutters(0.5)}
      width="100%"
    >
      <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
        <Typography
          id={guestAccessLabelId}
          color="text.primary"
          sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '20px' }}
        >
          {t('share-dialog.guest-access.label', 'Guest access')}
        </Typography>
        <Switch
          checked={guestAccessEnabled}
          onChange={handleToggleChange}
          color="primary"
          inputProps={{
            'aria-label': t('share-dialog.guest-access.toggle-label', 'Enable guest access'),
            'aria-labelledby': guestAccessLabelId,
          }}
        />
      </Box>

      {/* Guest URL field - only show when guest access is enabled */}
      {guestAccessEnabled && (
        <Box display="flex" alignItems="center" width="100%" gap={gutters(0.5)}>
          <TextField
            variant="outlined"
            value={guestUrl}
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
            onClick={handleCopyUrl}
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
