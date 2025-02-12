import { useMemo } from 'react';
import { useAccountPlanAvailabilityQuery } from '@/core/apollo/generated/apollo-hooks';
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

export const usePlanAvailability = ({ skip, accountId }: Props): Provided => {
  const { data: accountData, loading: loadingAccountData } = useAccountPlanAvailabilityQuery({
    variables: {
      accountId: accountId!,
    },
    skip: skip || !accountId,
  });

  const { privileges, entitlements } = useMemo(() => {
    const account = accountData?.lookup?.account;

    return {
      privileges: account?.authorization?.myPrivileges ?? [],
      entitlements: account?.license.availableEntitlements ?? [],
    };
  }, [accountData]);

  const isPlanAvailable = (plan: { name: string }) => {
    if (!accountData || loadingAccountData) {
      return false;
    }

    if (plan.name === LicensingCredentialBasedCredentialType.SpaceLicenseFree) {
      return (
        privileges.includes(AuthorizationPrivilege.CreateSpace) &&
        entitlements.includes(LicenseEntitlementType.AccountSpaceFree)
      );
    } else if (plan.name === LicensingCredentialBasedCredentialType.SpaceLicensePlus) {
      return (
        privileges.includes(AuthorizationPrivilege.CreateSpace) &&
        entitlements.includes(LicenseEntitlementType.AccountSpacePlus)
      );
    } else if (plan.name === LicensingCredentialBasedCredentialType.SpaceLicensePremium) {
      return (
        privileges.includes(AuthorizationPrivilege.CreateSpace) &&
        entitlements.includes(LicenseEntitlementType.AccountSpacePremium)
      );
    } else {
      return false; // switch from available to unavailable when we stopped using PlansTable
    }
  };

  return {
    loading: loadingAccountData,
    isPlanAvailable,
  };
};
