import { usePlansTableQuery } from '@/core/apollo/generated/apollo-hooks';
import { usePlanAvailability } from '@/domain/journey/space/createSpace/usePlanAvailability';
import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';

type Plan =
  | {
      id: string;
      name: string;
    }
  | undefined;

interface Provided {
  availablePlans: Plan[];
  loading: boolean;
  isPlanAvailable: (plan: { name: string }) => boolean;
}

type Props = {
  skip?: boolean;
  accountId?: string;
};

export const useSpacePlans = ({ skip, accountId }: Props): Provided => {
  const { data, loading: plansLoading } = usePlansTableQuery({ skip });
  const { isPlanAvailable, loading } = usePlanAvailability({ skip, accountId });

  const availablePlans = useMemo(
    () =>
      (
        data?.platform.licensingFramework.plans
          .filter(plan => plan.type === LicensingCredentialBasedPlanType.SpacePlan)
          .filter(plan => plan.enabled)
          .filter(plan => isPlanAvailable(plan))
          .sort((a, b) => a.sortOrder - b.sortOrder) ?? []
      ).map(plan => ({
        id: plan.id,
        name: plan.name,
      })),
    [data, isPlanAvailable]
  );

  return {
    availablePlans,
    loading: loading || plansLoading,
    isPlanAvailable,
  };
};
