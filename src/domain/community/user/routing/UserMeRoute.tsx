import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { MeUserProvider } from './MeUserContext';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';

const UserMeRoute = () => {
  const { t } = useTranslation();
  const { userModel, loadingMe } = useCurrentUserContext();

  return (
    <NoIdentityRedirect>
      {loadingMe || !userModel ? (
        <Loading text={t('pages.user-profile.loading')} />
      ) : (
        <MeUserProvider userId={userModel.id}>
          <Outlet />
        </MeUserProvider>
      )}
    </NoIdentityRedirect>
  );
};

export default UserMeRoute;
