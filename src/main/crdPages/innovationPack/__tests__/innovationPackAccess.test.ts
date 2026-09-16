import { describe, expect, test } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canDeleteOrgResource, canEditInnovationPack } from '../innovationPackAccess';

/**
 * The two predicates mirror the server's dual-path gates verbatim
 * (`innovation.pack.resolver.mutations.ts`: update = UPDATE ∨
 * PLATFORM_SUPPORT_ORG_RESOURCES, delete = DELETE ∨ PLATFORM_CONTENT_FULL_ACCESS).
 * Platform Support edits an ORGANIZATION's pack through its own privilege and
 * never holds DELETE on it; a user-hosted pack reports neither to Support
 * (FR-008(b) is scoped to organization resources), so the edit form must not
 * be offered there either — that is the sandbox walk that found this.
 */
describe('innovationPackAccess', () => {
  test('owner edits through Update', () => {
    expect(canEditInnovationPack([AuthorizationPrivilege.Update])).toBe(true);
  });
  test('Platform Support edits an org-owned pack through PlatformSupportOrgResources', () => {
    expect(canEditInnovationPack([AuthorizationPrivilege.PlatformSupportOrgResources])).toBe(true);
  });
  test('a user-hosted pack reports neither to Support → no edit', () => {
    expect(canEditInnovationPack([AuthorizationPrivilege.Read])).toBe(false);
    expect(canEditInnovationPack(undefined)).toBe(false);
  });
  test('delete: owner (Delete) or Content Full Access, never Support', () => {
    expect(canDeleteOrgResource([AuthorizationPrivilege.Delete])).toBe(true);
    expect(canDeleteOrgResource([AuthorizationPrivilege.PlatformContentFullAccess])).toBe(true);
    expect(canDeleteOrgResource([AuthorizationPrivilege.PlatformSupportOrgResources])).toBe(false);
    expect(canDeleteOrgResource(undefined)).toBe(false);
  });
});
