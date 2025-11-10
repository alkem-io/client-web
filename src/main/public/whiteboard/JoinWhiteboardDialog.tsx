import { FC, useState, useTransition, FormEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { validateGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator';
import { clearGuestSessionOnSignIn } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession';
import { useGuestAnalytics } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestAnalytics';
import { AUTH_REQUIRED_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';

export interface JoinWhiteboardDialogProps {
  open: boolean;
  onSubmit: (guestName: string) => void;
}

/**
 * Dialog component for prompting guest to enter their name
 * Only shown when guest name derivation is not possible (anonymous users)
 */
const JoinWhiteboardDialog: FC<JoinWhiteboardDialogProps> = ({ open, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { whiteboardId } = useParams<{ whiteboardId: string }>();
  const { trackGuestNameSubmitted, trackDialogDismissed } = useGuestAnalytics();
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Validate guest name
    const validation = validateGuestName(guestName);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(undefined);
    startTransition(() => {
      const trimmedName = guestName.trim();
      // Track manual guest name submission
      trackGuestNameSubmitted(trimmedName, false);
      onSubmit(trimmedName);
    });
  };

  const handleChange = (value: string) => {
    setGuestName(value);
    if (error) {
      setError(undefined);
    }
  };

  const handleSignIn = () => {
    // Track dialog dismissal (user chose to sign in instead)
    if (whiteboardId) {
      trackDialogDismissed(whiteboardId);
    }
    // Clear guest session data before navigating to auth
    clearGuestSessionOnSignIn();
    // Navigate to auth-required page with return URL to preserve public whiteboard access
    navigate(`${AUTH_REQUIRED_PATH}${buildReturnUrlParam(location.pathname)}`);
  };

  return (
    <Dialog open={open} aria-labelledby="join-dialog-title" maxWidth="sm" fullWidth>
      <DialogTitle id="join-dialog-title">
        {t('pages.public.whiteboard.join.title', 'Join Whiteboard')}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t(
            'pages.public.whiteboard.join.description',
            'Choose a guest name to join this whiteboard.'
          )}
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="guestName"
            name="guestName"
            label={t('pages.public.whiteboard.join.guestNameLabel', 'Guest Name')}
            value={guestName}
            onChange={e => handleChange(e.target.value)}
            required
            fullWidth
            autoFocus
            error={!!error}
            helperText={error}
            inputProps={{
              maxLength: 50,
              pattern: '[a-zA-Z0-9_-]+',
            }}
            placeholder={t('pages.public.whiteboard.join.placeholder', 'Enter a guest name')}
            autoComplete="off"
            sx={{ mb: 2 }}
          />
          <DialogActions sx={{ px: 0 }}>
            <Button onClick={handleSignIn} disabled={isPending}>
              {t('pages.public.whiteboard.join.signInButton', 'SIGN IN TO ALKEMIO')}
            </Button>
            <Button type="submit" variant="contained" disabled={isPending || !guestName.trim()}>
              {isPending
                ? t('pages.public.whiteboard.join.joiningButton', 'JOINING...')
                : t('pages.public.whiteboard.join.joinButton', 'JOIN AS GUEST')}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinWhiteboardDialog;
