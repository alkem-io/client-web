import { FC, useTransition } from 'react';
import { Dialog, DialogContent, Button, Typography, Stack, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { validateGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator';
import { clearGuestSessionOnSignIn } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession';
import { useGuestAnalytics } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestAnalytics';
import { buildLoginUrl } from '@/main/routing/urlBuilders';

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
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (values: { guestName: string }) => {
    startTransition(() => {
      const trimmedName = values.guestName.trim();
      // Track manual guest name submission
      trackGuestNameSubmitted(trimmedName, false);
      onSubmit(trimmedName);
    });
  };

  const validate = (values: { guestName: string }) => {
    const validation = validateGuestName(values.guestName);
    if (!validation.valid) {
      return { guestName: validation.error };
    }
    return {};
  };

  const handleSignIn = () => {
    // Track dialog dismissal (user chose to sign in instead)
    if (whiteboardId) {
      trackDialogDismissed(whiteboardId);
    }
    // Clear guest session data before navigating to auth
    clearGuestSessionOnSignIn();
    // Navigate to login page with return URL to preserve public whiteboard access
    navigate(buildLoginUrl(location.pathname));
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="join-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: theme => ({
          borderRadius: 1.5, // 12px
          padding: theme.spacing(4.4, 4.1), // 44px 41px
          maxWidth: 480,
          width: '100%',
          boxShadow: '0px 4px 35px 0px rgba(0, 0, 0, 0.1)',
        }),
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Formik
          initialValues={{ guestName: '' }}
          validate={validate}
          onSubmit={handleSubmit}
          validateOnChange
          validateOnBlur
        >
          {({ isValid, dirty }) => (
            <Form noValidate>
              <Stack spacing={2.5}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={theme => ({
                      fontSize: '15px',
                      color: theme.palette.neutral.light,
                    })}
                  >
                    {t('pages.public.whiteboard.join.welcome')}
                  </Typography>
                  <Typography
                    id="join-dialog-title"
                    sx={theme => ({
                      fontSize: '40px',
                      fontWeight: 500,
                      lineHeight: '48px',
                      color: theme.palette.primary.main,
                    })}
                  >
                    {t('pages.public.whiteboard.join.title')}
                  </Typography>
                </Box>

                {/* Form Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography
                      variant="body2"
                      sx={theme => ({
                        fontSize: '14px',
                        color: theme.palette.neutral.light,
                      })}
                    >
                      {t('pages.public.whiteboard.join.description')}
                    </Typography>

                    <FormikInputField
                      name="guestName"
                      title="" // No visible label in design
                      required
                      fullWidth
                      placeholder={t('pages.public.whiteboard.join.placeholder')}
                      aria-label={t('pages.public.whiteboard.join.guestNameLabel')}
                      autoComplete="off"
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isPending || !isValid || !dirty}
                    sx={{ py: 1.25 }}
                  >
                    {isPending
                      ? t('pages.public.whiteboard.join.joiningButton')
                      : t('pages.public.whiteboard.join.joinButton')}
                  </Button>

                  <Button onClick={handleSignIn} variant="outlined" fullWidth disabled={isPending} sx={{ py: 1.25 }}>
                    {t('pages.public.whiteboard.join.signInButton')}
                  </Button>
                </Box>
              </Stack>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default JoinWhiteboardDialog;
