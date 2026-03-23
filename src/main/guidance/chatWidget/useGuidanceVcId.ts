import { usePlatformGuidanceVcQuery } from '@/core/apollo/generated/apollo-hooks';
import { VirtualContributorWellKnown } from '@/core/apollo/generated/graphql-schema';

export const useGuidanceVcId = ({ skip = false } = {}) => {
  const { data, loading } = usePlatformGuidanceVcQuery({ skip });

  const guidanceVcId =
    data?.platform.wellKnownVirtualContributors.mappings.find(
      m => m.wellKnown === VirtualContributorWellKnown.ChatGuidance
    )?.virtualContributorID ?? null;

  return { guidanceVcId, loading };
};
