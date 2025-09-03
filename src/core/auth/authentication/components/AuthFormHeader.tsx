import { Link as RouterLink } from 'react-router-dom';
import Gutters from '@/core/ui/grid/Gutters';
import { Box, Typography } from '@mui/material';
import { Link } from '@mui/material';
import { _AUTH_LOGIN_PATH, AUTH_SIGN_UP_PATH } from '../constants/authentication.constants';
import { useTranslation } from 'react-i18next';

export const AuthFormHeader = ({
  title,
  haveAccountMessage = false,
  hideMessage = false,
}: {
  title: string;
  haveAccountMessage?: boolean;
  hideMessage?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Gutters row justifyContent="space-between" sx={{ paddingBottom: 0 }}>
      <Box>
        <Typography color="muted.contrastText">{t('pages.home.sections.welcome.welcomeUnauthenticated')}</Typography>
        <Typography sx={{ fontSize: '40px', fontWeight: '500', paddingTop: 2 }} variant="h1">
          {title}
        </Typography>
      </Box>
      {!hideMessage && (
        <Box sx={{ display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
          <Typography sx={{ whiteSpace: 'nowrap' }} color="muted.contrastText">
            {t(haveAccountMessage ? 'authentication.have-account' : 'authentication.no-account')}
          </Typography>
          <Link
            component={RouterLink}
            to={haveAccountMessage ? _AUTH_LOGIN_PATH : AUTH_SIGN_UP_PATH}
            sx={{
              '&:hover': { color: theme => theme.palette.highlight.dark },
              color: theme => theme.palette.highlight.dark,
              fontWeight: 'bold',
            }}
          >
            {t(haveAccountMessage ? 'authentication.sign-in' : 'authentication.sign-up')}
          </Link>
        </Box>
      )}
    </Gutters>
  );
};
