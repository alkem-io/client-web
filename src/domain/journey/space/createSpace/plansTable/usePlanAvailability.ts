import { useUserContext } from '../../../../community/user';
import { useFreePlanAvailabilityQuery } from '@core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, LicenseCredential } from '@core/apollo/generated/graphql-schema';

interface Provided {
  loading: boolean;
  isPlanAvailable: (plan: { name: string }) => boolean;
}

// TODO: This is temporary
// At the moment the logic is just checking if the user has CreateSpace privilege to allow the FREE plan
// but in the future it should check the license and the other spaces created
export const usePlanAvailability = ({ skip }: { skip?: boolean }): Provided => {
  const { user: currentUser, loading: loadingUser } = useUserContext();

  const { data: freePlanAvailableData, loading: loadingPlanAvailability } = useFreePlanAvailabilityQuery({
    skip,
  });
  const myPrivileges = freePlanAvailableData?.me.user?.account?.authorization?.myPrivileges ?? [];

  const isPlanAvailable = (plan: { name: string }) => {
    if (loadingUser || loadingPlanAvailability) {
      return false;
    }
    if (!currentUser?.user.id) {
      return false;
    }
    if (plan.name === LicenseCredential.SpaceLicenseFree) {
      return myPrivileges.includes(AuthorizationPrivilege.CreateSpace);
    } else {
      return true;
    }
  };

  return {
    loading: loadingPlanAvailability || loadingUser,
    isPlanAvailable,
  };
};
