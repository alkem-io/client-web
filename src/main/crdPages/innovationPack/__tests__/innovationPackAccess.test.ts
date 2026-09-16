import { describe, expect, test } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canDeleteOrgResource, canEditInnovationPack, toRouterPath } from '../innovationPackAccess';

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
  // Sandbox walk 2026-09-16: the redirect appended the absolute profile URL to the
  // settings route. The router must get a path, never an absolute URL.
  test('toRouterPath reduces an absolute profile url to its in-app path', () => {
    expect(toRouterPath('https://sandbox-alkem.io/innovation-packs/templ1')).toBe('/innovation-packs/templ1');
    expect(toRouterPath('https://x.io/a/b?tab=1#h')).toBe('/a/b?tab=1#h');
    expect(toRouterPath('/already/a/path')).toBe('/already/a/path');
  });

  test('delete: owner (Delete) or Content Full Access, never Support', () => {
    expect(canDeleteOrgResource([AuthorizationPrivilege.Delete])).toBe(true);
    expect(canDeleteOrgResource([AuthorizationPrivilege.PlatformContentFullAccess])).toBe(true);
    expect(canDeleteOrgResource([AuthorizationPrivilege.PlatformSupportOrgResources])).toBe(false);
    expect(canDeleteOrgResource(undefined)).toBe(false);
  });
});
