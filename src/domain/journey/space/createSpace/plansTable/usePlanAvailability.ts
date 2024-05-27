import { useAccountsHostsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../community/user';

interface Provided {
  loading: boolean;
  isFreePlanAvailable: () => boolean;
}

// TODO: This is temporary
// At the moment the logic is checking if the user is the host of any other space
// but in the future it should block the availability of the FREE plan if the user has a trial or paid one.
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
