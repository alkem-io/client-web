/**
 * Unit tests for useSelectionCandidates helper functions (feature 025, T005).
 *
 * The hook itself relies on Apollo Client and can't be unit-tested without a
 * full provider stack — so we test the pure-function exports and the internal
 * shape logic that lives alongside the hook.
 *
 * Key behaviors validated here:
 *
 *  - omitIneligibleIds: the core strip function. Eligible=true ids are kept;
 *    eligible=false ids are removed. Email chips are never stripped.
 *
 *  - corr-client-5 fix: eligibility is checked against the FULL all-types
 *    membership set (not just the callout's configured contributor types).
 *    An org that is a valid community member must NOT be stripped merely
 *    because 'organization' is not in the callout's configured types.
 *    This is enforced by the hook always fetching all three types and using
 *    the resulting allMembersById map in resolveChips — the pure-function
 *    tests below validate that omitIneligibleIds behaves correctly when the
 *    chip set is built from the full membership (eligible=true for any still-
 *    member id regardless of type configuration).
 *
 *  - corr-client-3 / qual-client-1 (loading guard): the hook returns a
 *    `loading` flag; the connector skips the strip when loading is true.
 *    This cannot be unit-tested without an Apollo provider; covered by the
 *    connector integration tests and manual scenario acceptance.
 *
 *  - corr-client-2 (concurrent-churn refetch): the hook exposes `refetch`;
 *    the connector calls it in the saveEdit catch block. Also not unit-
 *    testable here for the same reason.
 */
import { describe, expect, test } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { ContributorSelectorInvitee } from '@/crd/forms/ContributorSelector';
import { actorTypeToContributorTypeId, omitIneligibleIds } from './useSelectionCandidates';

// ---------------------------------------------------------------------------
// omitIneligibleIds
// ---------------------------------------------------------------------------
describe('omitIneligibleIds', () => {
  test('returns all ids when all chips are eligible', () => {
    const chips: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u1', displayName: 'Alice', eligible: true },
      { kind: 'organization', id: 'o1', displayName: 'Acme', eligible: true },
    ];
    expect(omitIneligibleIds(['u1', 'o1'], chips)).toEqual(['u1', 'o1']);
  });

  test('omits ids whose chips have eligible=false', () => {
    const chips: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u1', displayName: 'Gone', eligible: false },
      { kind: 'user', userId: 'u2', displayName: 'Alice', eligible: true },
    ];
    expect(omitIneligibleIds(['u1', 'u2'], chips)).toEqual(['u2']);
  });

  test('omits org + vc ineligible ids', () => {
    const chips: ContributorSelectorInvitee[] = [
      { kind: 'organization', id: 'o1', displayName: 'OldOrg', eligible: false },
      { kind: 'virtualContributor', id: 'vc1', displayName: 'OldVC', eligible: false },
      { kind: 'organization', id: 'o2', displayName: 'GoodOrg', eligible: true },
    ];
    expect(omitIneligibleIds(['o1', 'vc1', 'o2'], chips)).toEqual(['o2']);
  });

  test('handles empty selectedIds', () => {
    const chips: ContributorSelectorInvitee[] = [{ kind: 'user', userId: 'u1', displayName: 'Alice', eligible: true }];
    expect(omitIneligibleIds([], chips)).toEqual([]);
  });

  test('handles empty chips (returns all ids unchanged)', () => {
    expect(omitIneligibleIds(['u1', 'u2'], [])).toEqual(['u1', 'u2']);
  });

  test('email chips are always considered eligible (not in scope for custom selection)', () => {
    const chips: ContributorSelectorInvitee[] = [
      { kind: 'email', email: 'a@b.com' },
      { kind: 'user', userId: 'u1', displayName: 'Alice', eligible: true },
    ];
    // email entries have no id/userId in the selectedIds array so they can't
    // match — all selectedIds remain
    expect(omitIneligibleIds(['u1'], chips)).toEqual(['u1']);
  });

  // corr-client-5: an org that is a valid community member must NOT be stripped
  // when the callout's configured types no longer include 'organization'.
  // The hook now fetches all types for eligibility; resolveChips marks any still-
  // member id as eligible=true regardless of the callout's configured types.
  // This test validates the pure-function contract: when the chip set is built from
  // the full membership (eligible=true for the org), omitIneligibleIds preserves it.
  test('preserves an org id that is eligible even if it would be outside the configured types (corr-client-5)', () => {
    // Simulates: callout configured with types=['user'] only, but the org O
    // is still a valid community member. The hook's all-types query finds it;
    // resolveChips returns eligible=true for O. omitIneligibleIds must keep O.
    const chips: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u1', displayName: 'Alice', eligible: true },
      // org found in the all-types membership map → eligible: true
      { kind: 'organization', id: 'o1', displayName: 'Acme', eligible: true },
    ];
    expect(omitIneligibleIds(['u1', 'o1'], chips)).toEqual(['u1', 'o1']);
  });

  // Contrast: an org that genuinely left the community (not in allMembersById)
  // is correctly stripped (eligible: false from resolveChips).
  test('strips an org id that is no longer a community member (departed member)', () => {
    const chips: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u1', displayName: 'Alice', eligible: true },
      // org NOT found in allMembersById → eligible: false (stale entry)
      { kind: 'organization', id: 'o-gone', displayName: 'o-gone', eligible: false },
    ];
    expect(omitIneligibleIds(['u1', 'o-gone'], chips)).toEqual(['u1']);
  });
});

// ---------------------------------------------------------------------------
// actorTypeToContributorTypeId
// ---------------------------------------------------------------------------
describe('actorTypeToContributorTypeId', () => {
  test('maps User → user', () => {
    expect(actorTypeToContributorTypeId(ActorType.User)).toBe('user');
  });

  test('maps Organization → organization', () => {
    expect(actorTypeToContributorTypeId(ActorType.Organization)).toBe('organization');
  });

  test('maps VirtualContributor → virtualContributor', () => {
    expect(actorTypeToContributorTypeId(ActorType.VirtualContributor)).toBe('virtualContributor');
  });
});
