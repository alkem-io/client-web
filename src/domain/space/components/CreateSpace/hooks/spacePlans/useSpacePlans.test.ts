import { describe, expect, it } from 'vitest';
import type { CreateSpaceAccountFragment, CreateSpacePlansQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { availableSpacePlans } from './useSpacePlans';

const quota = (name: string, flag: string) => ({
  name,
  effectiveEntitlement: flag,
  creationKinds: [{ entityType: 'space', kind: 'space' }],
});

// Shapes of the seed: account quotas account-space-* map to the space plan flags space-* (019 entity_type_config.tsv).
const plansData: CreateSpacePlansQuery = {
  plans: [
    {
      id: 'premium',
      name: 'SPACE_LICENSE_PREMIUM',
      sortOrder: 30,
      enabled: true,
      entitlements: [{ name: 'space-premium' }],
    },
    { id: 'free', name: 'SPACE_LICENSE_FREE', sortOrder: 10, enabled: true, entitlements: [{ name: 'space-free' }] },
    {
      id: 'plus',
      name: 'SPACE_LICENSE_PLUS',
      sortOrder: 20,
      enabled: true,
      entitlements: [{ name: 'space-plus' }, { name: 'space-flag-save-as-template' }],
    },
    { id: 'disabled', name: 'SPACE_LICENSE_OLD', sortOrder: 0, enabled: false, entitlements: [{ name: 'space-free' }] },
  ],
  config: {
    entitlementCatalog: [
      quota('account-space-free', 'space-free'),
      quota('account-space-plus', 'space-plus'),
      quota('account-space-premium', 'space-premium'),
      {
        name: 'account-virtual-contributor',
        effectiveEntitlement: null,
        creationKinds: [{ entityType: 'virtual_contributor', kind: 'vc' }],
      },
      { name: 'space-free', effectiveEntitlement: null, creationKinds: [] },
    ],
  },
};

const account = (allowed: Record<string, boolean>): CreateSpaceAccountFragment => ({
  id: 'account-1',
  canCreate: [
    {
      kind: 'space',
      allowed: Object.values(allowed).some(Boolean),
      reason: null,
      byEntitlement: Object.entries(allowed).map(([name, ok]) => ({ name, allowed: ok })),
    },
    { kind: 'vc', allowed: true, reason: null, byEntitlement: [{ name: 'account-space-premium', allowed: true }] },
  ],
});

describe('availableSpacePlans', () => {
  it('keeps the enabled plans whose flag is the effective entitlement of an allowed space quota, by sortOrder', () => {
    const plans = availableSpacePlans(
      plansData,
      account({ 'account-space-free': true, 'account-space-plus': false, 'account-space-premium': true })
    );
    expect(plans.map(plan => plan.id)).toEqual(['free', 'premium']);
  });

  it('ignores allowances of other creation kinds', () => {
    expect(availableSpacePlans(plansData, account({ 'account-space-free': false }))).toEqual([]);
  });

  it('offers nothing before the account or the plans are read', () => {
    expect(availableSpacePlans(undefined, account({ 'account-space-free': true }))).toEqual([]);
    expect(availableSpacePlans(plansData, undefined)).toEqual([]);
  });
});
