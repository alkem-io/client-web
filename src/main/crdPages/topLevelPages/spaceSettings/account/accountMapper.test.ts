import { describe, expect, it } from 'vitest';
import {
  ActorType,
  LicensingCredentialBasedPlanType,
  type SpaceAccountQuery,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { mapAccountHost, mapAccountPlan, mapAccountVisibility } from './accountMapper';

type SpaceData = NonNullable<SpaceAccountQuery['lookup']['space']>;
type PlatformData = SpaceAccountQuery['platform'];

const space = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 's1',
    activeSubscription: null,
    about: { provider: null },
    ...overrides,
  }) as unknown as SpaceData;

const platform = {
  licensingFramework: {
    plans: [
      { name: 'Plus', type: LicensingCredentialBasedPlanType.SpacePlan, licenseCredential: 'SPACE_LICENSE_PLUS' },
      { name: 'Account', type: LicensingCredentialBasedPlanType.AccountPlan, licenseCredential: 'ACCOUNT_LICENSE' },
    ],
  },
} as unknown as PlatformData;

describe('mapAccountVisibility (spec 045 FR-024b)', () => {
  it.each([
    [SpaceVisibility.Active, 'active'],
    [SpaceVisibility.Archived, 'archived'],
    [SpaceVisibility.Demo, 'demo'],
    [SpaceVisibility.Inactive, 'inactive'],
  ])('maps %s to %s', (input, expected) => {
    expect(mapAccountVisibility(input)).toBe(expected);
  });

  it('returns null before the space has loaded', () => {
    expect(mapAccountVisibility(undefined)).toBeNull();
  });
});

describe('mapAccountHost (spec 045 FR-024b)', () => {
  const withProvider = (type: ActorType) =>
    space({ about: { provider: { id: 'h1', type, profile: { displayName: 'Acme', avatar: { uri: 'a.png' } } } } });

  it.each([
    [ActorType.Organization, 'organization'],
    [ActorType.User, 'user'],
    [ActorType.VirtualContributor, 'virtualContributor'],
  ])('maps a %s host to the %s type', (type, expected) => {
    expect(mapAccountHost(withProvider(type))).toEqual({ displayName: 'Acme', avatarUrl: 'a.png', type: expected });
  });

  it('leaves the type out for any other actor', () => {
    expect(mapAccountHost(withProvider(ActorType.Account))?.type).toBeNull();
  });

  it('returns null without a provider profile', () => {
    expect(mapAccountHost(space())).toBeNull();
  });
});

describe('mapAccountPlan', () => {
  it('returns null with no active subscription', () => {
    expect(mapAccountPlan(space(), platform)).toBeNull();
  });

  it('returns null when the subscription matches no space plan', () => {
    expect(
      mapAccountPlan(space({ activeSubscription: { name: 'ACCOUNT_LICENSE', expires: null } }), platform)
    ).toBeNull();
  });

  it('names the matching space plan, without days left when it never expires', () => {
    expect(
      mapAccountPlan(space({ activeSubscription: { name: 'SPACE_LICENSE_PLUS', expires: null } }), platform)
    ).toEqual({ name: 'Plus', features: [], daysLeft: null });
  });

  it('counts the days left, never below zero', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(
      mapAccountPlan(space({ activeSubscription: { name: 'SPACE_LICENSE_PLUS', expires: past } }), platform)?.daysLeft
    ).toBe(0);
  });
});
