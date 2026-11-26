import { useCreateSpacePlansQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { CreateSpaceAccountFragment, CreateSpacePlansQuery } from '@/core/apollo/generated-v2/graphql-schema';

const SPACE_ENTITY_TYPE = 'space';

type Plan = { id: string; name: string };

type Props = {
  account: CreateSpaceAccountFragment | undefined;
  skip?: boolean;
};

type Provided = {
  availablePlans: Plan[];
  loading: boolean;
};

/**
 * The enabled space plans the account can create with, by sortOrder (legacy useSpacePlans.ts:23-32,
 * usePlanAvailability.ts:34-60). A plan is available when one of its entitlement flags is the
 * effectiveEntitlement of an account quota that canCreate allows for the space creation kind
 * (extensibility.md:765-785, e.g. account-space-premium → space-premium; never a client name table).
 */
export const availableSpacePlans = (
  data: CreateSpacePlansQuery | undefined,
  account: CreateSpaceAccountFragment | undefined
): Plan[] => {
  if (!data || !account) return [];
  const catalog = data.config.entitlementCatalog;
  const spaceKinds = new Set(
    catalog.flatMap(entry =>
      entry.creationKinds.filter(kind => kind.entityType === SPACE_ENTITY_TYPE).map(kind => kind.kind)
    )
  );
  const effectiveOf = new Map(catalog.map(entry => [entry.name, entry.effectiveEntitlement ?? undefined]));
  const allowedFlags = new Set(
    account.canCreate
      .filter(entry => spaceKinds.has(entry.kind))
      .flatMap(entry => entry.byEntitlement.filter(row => row.allowed))
      .map(row => effectiveOf.get(row.name))
      .filter((flag): flag is string => flag !== undefined)
  );
  return data.plans
    .filter(plan => plan.enabled)
    .filter(plan => plan.entitlements.some(entitlement => allowedFlags.has(entitlement.name)))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(plan => ({ id: plan.id, name: plan.name }));
};

export const useSpacePlans = ({ account, skip = false }: Props): Provided => {
  const { data, loading } = useCreateSpacePlansQuery({ skip: skip || !account });
  return { availablePlans: availableSpacePlans(data, account), loading };
};
