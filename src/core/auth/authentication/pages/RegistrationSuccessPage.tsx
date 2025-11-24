import { Trans, useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import { AUTH_VERIFY_PATH } from '../constants/authentication.constants';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import { Box } from '@mui/material';
import Paragraph from '@/domain/shared/components/Text/Paragraph';
import { useEffect } from 'react';
import { clearAllGuestSessionData } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';

export const RegistrationSuccessPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Clear all guest session data (name, whiteboard URL) on successful registration
    clearAllGuestSessionData();
  }, []);

  return (
    <AuthenticationLayout>
      <AuthFormHeader title={t('authentication.sign-up')} haveAccountMessage />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap={1}
        width="100%"
        minWidth={theme => ({ sm: theme.spacing(36) })}
        padding={2}
        sx={{
          color: theme => theme.palette.neutral.light,
        }}
      >
        <Trans
          i18nKey="pages.registrationSuccess.message"
          components={{
            resend: <RouterLink to={AUTH_VERIFY_PATH} underline="always" />,
            p: <Paragraph fontSize="15" />,
          }}
        />
      </Box>
    </AuthenticationLayout>
  );
};

export default RegistrationSuccessPage;
