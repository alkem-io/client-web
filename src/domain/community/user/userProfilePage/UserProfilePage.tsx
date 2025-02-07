import Loading from '@/core/ui/loading/Loading';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';
import { Error404 } from '@/core/pages/Errors/Error404';
import { useUserMetadata } from '../hooks/useUserMetadata';
import UserPageLayout from '../layout/UserPageLayout';
import UserProfilePageView from './UserProfilePageView';
import useUserContributions from '../userContributions/useUserContributions';
import useUserOrganizationIds from '../userContributions/useUserOrganizationIds';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import { useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';

export const UserProfilePage = () => {
  const { userId } = useUrlResolver();

  const { user: userMetadata, loading } = useUserMetadata(userId);

  const { data: userData, loading: loadingUser } = useUserAccountQuery({
    variables: { userId: userId! },
    skip: !userId,
  });

  const accountResources = useAccountResources(userData?.lookup.user?.account?.id);

  const contributions = useUserContributions(userMetadata?.user.id);

  const organizationIds = useUserOrganizationIds(userMetadata?.user.id);

  if (loading || loadingUser || !userId) return <Loading text={'Loading User Profile ...'} />;

  if (!userMetadata) {
    return (
      <UserPageLayout>
        <Error404 />
      </UserPageLayout>
    );
  }

  return (
    <UserPageLayout>
      <UserProfilePageView
        contributions={contributions}
        accountResources={accountResources}
        organizationIds={organizationIds}
        entities={{ userMetadata }}
      />
    </UserPageLayout>
  );
};

export default UserProfilePage;
