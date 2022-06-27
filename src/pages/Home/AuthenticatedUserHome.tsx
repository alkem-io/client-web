import MyHubsSection from '../../domain/hub/MyHubs/MyHubsSection';
import { useTranslation } from 'react-i18next';
import { UserContextValue } from '../../domain/user/providers/UserProvider/UserProvider';
import Typography from '../../components/core/Typography';
import { Grid } from '@mui/material';

interface AuthenticatedUserHomeProps {
  user: UserContextValue;
}

const AuthenticatedUserHome = ({ user }: AuthenticatedUserHomeProps) => {
  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <Typography variant="h3" weight="bold">
        {t('pages.home.sections.welcome.welcome-back', { username: user.user?.user.firstName })}
      </Typography>
      <MyHubsSection userHubRoles={user.userHubRoles} loading={user.loading} />
    </Grid>
  );
};

export default AuthenticatedUserHome;
