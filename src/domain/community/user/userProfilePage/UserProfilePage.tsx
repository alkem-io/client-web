import Loading from '@/core/ui/loading/Loading';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { Error404 } from '@/core/pages/Errors/Error404';
import { useUserProvider } from '../hooks/useUserProvider';
import UserProfilePageView from './UserProfilePageView';
import useUserContributions from '../userContributions/useUserContributions';
import useUserOrganizationIds from '../userContributions/useUserOrganizationIds';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import { useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';

export const UserProfilePage = () => {
  const { userId, loading: urlResolverLoading } = useUrlResolver();

  const { user: userModel, loading } = useUserProvider(userId);

  const { data: userData, loading: loadingUser } = useUserAccountQuery({
    variables: { userId: userId! },
    skip: !userId,
  });

  const accountResources = useAccountResources(userData?.lookup.user?.account?.id);

  const contributions = useUserContributions(userModel?.id);

  const organizationIds = useUserOrganizationIds(userModel?.id);

  if (urlResolverLoading || loading || loadingUser || !userId) return <Loading text={'Loading User Profile ...'} />;

  if (!userModel) {
    return <Error404 />;
  }

  return (
    <UserProfilePageView
      contributions={contributions}
      accountResources={accountResources}
      organizationIds={organizationIds}
      userModel={userModel}
    />
  );
};

export default UserProfilePage;
