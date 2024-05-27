import { useAccountsHostsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../community/user';

interface Provided {
  loading: boolean;
  isFreePlanAvailable: () => boolean;
}

export const usePlanAvailability = ({ skip }: { skip?: boolean }): Provided => {
  const { user: currentUser, loading: loadingUser } = useUserContext();

  const { data, loading: loadingHosts } = useAccountsHostsQuery({
    skip,
  });

  const isFreePlanAvailable = () => {
    if (loadingUser || loadingHosts) {
      return false;
    }
    if (!currentUser?.user.id) {
      return false;
    }
    const userIsHost = data?.accounts.some(account => account.hosts?.some(host => host.id === currentUser.user.id));
    return !userIsHost;
  };
  return {
    loading: loadingHosts || loadingUser,
    isFreePlanAvailable,
  };
};
