import { useUserContext } from '../../../../community/user';
import { useFreePlanAvailabilityQuery } from '../../../../../core/apollo/generated/apollo-hooks';

interface Provided {
  loading: boolean;
  isPlanAvailable: (plan: { name: string }) => boolean;
}

// TODO: This is temporary
// At the moment the logic is checking if the user is the host of any other space
// but in the future it should block the availability of the FREE plan if the user has a trial or paid one.
export const usePlanAvailability = ({ skip }: { skip?: boolean }): Provided => {
  const { user: currentUser, loading: loadingUser } = useUserContext();

  const { data: freePlanAvailableData, loading: loadingPlanAvailability } = useFreePlanAvailabilityQuery({
    skip,
  });

  const isPlanAvailable = (plan: { name: string }) => {
    if (loadingUser || loadingPlanAvailability) {
      return false;
    }
    if (!currentUser?.user.id) {
      return false;
    }
    if (plan.name === 'FREE') {
      return freePlanAvailableData?.me.canCreateFreeSpace ?? false;
    } else {
      return true;
    }
  };

  return {
    loading: loadingPlanAvailability || loadingUser,
    isPlanAvailable,
  };
};
