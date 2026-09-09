import { describe, expect, it, vi } from 'vitest';
import {
  AuthenticationType,
  AuthorizationPrivilege,
  LicenseEntitlementType,
} from '@/core/apollo/generated/graphql-schema';
import { canStartMemoSigning, updateMemoMarkdownCache } from '@/main/crdPages/memo/CrdMemoDialog';

describe('updateMemoMarkdownCache', () => {
  it('does not replace cached content when the editor has not mounted', async () => {
    const writeMarkdown = vi.fn();

    await updateMemoMarkdownCache(null, writeMarkdown);

    expect(writeMarkdown).not.toHaveBeenCalled();
  });

  it('does not read or replace content for a look-only session', async () => {
    const editor = { getHTML: vi.fn(() => '<p>unchanged</p>') };
    const writeMarkdown = vi.fn();

    await updateMemoMarkdownCache(editor, writeMarkdown, false);

    expect(editor.getHTML).not.toHaveBeenCalled();
    expect(writeMarkdown).not.toHaveBeenCalled();
  });
});

describe('canStartMemoSigning', () => {
  it.each([
    {
      privileges: [AuthorizationPrivilege.Contribute],
      entitlements: [LicenseEntitlementType.SpaceFlagMemoSigning],
      authenticationMethods: [AuthenticationType.Cleverbase],
      authenticationMethodsReady: true,
      expected: true,
    },
    {
      privileges: [AuthorizationPrivilege.Read],
      entitlements: [LicenseEntitlementType.SpaceFlagMemoSigning],
      authenticationMethods: [AuthenticationType.Cleverbase],
      authenticationMethodsReady: true,
      expected: false,
    },
    {
      privileges: [AuthorizationPrivilege.Contribute],
      entitlements: [],
      authenticationMethods: [AuthenticationType.Cleverbase],
      authenticationMethodsReady: true,
      expected: false,
    },
    {
      privileges: [AuthorizationPrivilege.Contribute],
      entitlements: [LicenseEntitlementType.SpaceFlagMemoSigning],
      authenticationMethods: [AuthenticationType.Email],
      authenticationMethodsReady: true,
      expected: false,
    },
    {
      privileges: [AuthorizationPrivilege.Contribute],
      entitlements: [LicenseEntitlementType.SpaceFlagMemoSigning],
      authenticationMethods: [AuthenticationType.Cleverbase],
      authenticationMethodsReady: false,
      expected: false,
    },
  ])('returns $expected for the complete signing gate', gate => {
    expect(
      canStartMemoSigning(
        gate.privileges,
        gate.entitlements,
        gate.authenticationMethods,
        gate.authenticationMethodsReady
      )
    ).toBe(gate.expected);
  });
});
