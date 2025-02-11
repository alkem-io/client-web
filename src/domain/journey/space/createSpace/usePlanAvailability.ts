import { useUserContext } from '@/domain/community/user';
import { useFreePlanAvailabilityQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  LicenseEntitlementType,
  LicensingCredentialBasedCredentialType,
} from '@/core/apollo/generated/graphql-schema';

interface Provided {
  loading: boolean;
  isPlanAvailable: (plan: { name: string }) => boolean;
}

type Props = {
  skip?: boolean;
  accountId?: string;
};

export const usePlanAvailability = ({ skip }: Props): Provided => {
  const { user: currentUser, loading: loadingUser } = useUserContext();

  const { data: meData, loading: loadingMeData } = useFreePlanAvailabilityQuery({
    skip,
  });

  // TODO: if accountId is provided, fetch account privileges (and skip loadingUser)
  const myPrivileges = meData?.me.user?.account?.authorization?.myPrivileges ?? [];
  const entitlements = meData?.me.user?.account?.license?.availableEntitlements ?? [];

  const isPlanAvailable = (plan: { name: string }) => {
    if (loadingUser || loadingMeData || !currentUser?.user?.id) {
      return false;
    }

    //TODO: Add or remove explicit checks if needed
    if (plan.name === LicensingCredentialBasedCredentialType.SpaceLicenseFree) {
      return (
        myPrivileges.includes(AuthorizationPrivilege.CreateSpace) &&
        entitlements.includes(LicenseEntitlementType.AccountSpaceFree)
      );
    } else if (plan.name === LicensingCredentialBasedCredentialType.SpaceLicensePlus) {
      return (
        myPrivileges.includes(AuthorizationPrivilege.CreateSpace) &&
        entitlements.includes(LicenseEntitlementType.AccountSpacePlus)
      );
    } else if (plan.name === LicensingCredentialBasedCredentialType.SpaceLicensePremium) {
      return (
        myPrivileges.includes(AuthorizationPrivilege.CreateSpace) &&
        entitlements.includes(LicenseEntitlementType.AccountSpacePremium)
      );
    } else {
      return false; // switch from available to unavailable when we stopped using PlansTable
    }
  };

  return {
    loading: loadingMeData || loadingUser,
    isPlanAvailable,
  };
};
