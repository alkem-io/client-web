import { FC, useState } from 'react';
import { Box, Switch, TextField, InputAdornment, IconButton, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { gutters } from '@/core/ui/grid/utils';

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

  // TODO: Generate actual guest URL from backend
  // For now, using placeholder URL structure
  const guestUrl = whiteboard?.nameID ? `${window.location.origin}/guest/whiteboard/${whiteboard.nameID}` : '';

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGuestAccessEnabled(event.target.checked);
    // TODO: Call mutation to update whiteboard guest access setting
  };

  const handleCopyUrl = () => {
    if (guestUrl) {
      navigator.clipboard.writeText(guestUrl);
      // TODO: Show success toast notification
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={gutters(1)} marginTop={gutters(2)}>
      {/* Guest access toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={guestAccessEnabled}
            onChange={handleToggleChange}
            color="primary"
            inputProps={{ 'aria-label': t('share-dialog.guest-access.toggle-label', 'Enable guest access') }}
          />
        }
        label={t('share-dialog.guest-access.label', 'Guest access')}
      />

      {/* Guest URL field - only show when guest access is enabled */}
      {guestAccessEnabled && (
        <TextField
          value={guestUrl}
          label={t('share-dialog.guest-access.url-label', 'Guest URL')}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleCopyUrl}
                  edge="end"
                  aria-label={t('share-dialog.guest-access.copy-url', 'Copy guest URL')}
                >
                  <ContentCopyIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
          sx={{ marginTop: gutters(0.5) }}
        />
      )}
    </Box>
  );
};

export default WhiteboardGuestAccessSection;
