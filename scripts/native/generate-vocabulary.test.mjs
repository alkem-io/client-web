import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateVocabulary, rewriteLegacyModule } from './generate-vocabulary.mjs';

const input = {
  clientDeclarations: "export enum RoleName { PlatformRolesAdmin = 'PLATFORM_ROLES_ADMIN', Member = 'MEMBER' } export enum LicenseEntitlementType { AccountVirtualContributor = 'ACCOUNT_VIRTUAL_CONTRIBUTOR' }",
  roleDeclarations: "export enum RoleName { PLATFORM_ROLES_ADMIN = 'platform-roles-admin', MEMBER = 'member' }",
  entitlementDeclarations: "export enum LicenseEntitlementType { ACCOUNT_VIRTUAL_CONTRIBUTOR = 'account-virtual-contributor' }",
  vocabulary: { roles: ['roles-admin', 'member'], entitlements: ['account-virtual-contributor'], legacy_credential_types: [{ source_role: 'platform-roles-admin', target_role: 'roles-admin', platform_resource: true }] },
};
test('joins both original declaration files and the declared vocabulary literally', () => {
  const output = generateVocabulary(input);
  assert.match(output, /PlatformRolesAdmin = "roles-admin"/);
  assert.match(output, /Member = "member"/);
  assert.match(output, /AccountVirtualContributor = "account-virtual-contributor"/);
});
test('missing original credential mapping fails instead of stripping the platform prefix', () => {
  assert.throws(() => generateVocabulary({ ...input, vocabulary: { ...input.vocabulary, legacy_credential_types: [] } }), /Unmatched legacy identifiers.*\nRoleName.PlatformRolesAdmin/s);
});
test('an unknown source identifier or undeclared target fails without inventing a name', () => {
  assert.throws(() => generateVocabulary({ ...input, clientDeclarations: input.clientDeclarations.replace("'MEMBER'", "'RENAMED_MEMBER'") }), /missing declaration/);
  assert.throws(() => generateVocabulary({ ...input, vocabulary: { ...input.vocabulary, legacy_credential_types: [{ source_role: 'platform-roles-admin', target_role: 'invented' }] } }), /Undeclared role target/);
});

test('declared audience pseudo-roles are excluded and never become credential values', () => {
  const result = generateVocabulary({ ...input,
    clientDeclarations: input.clientDeclarations.replace("Member = 'MEMBER'", "Member = 'MEMBER', Anonymous = 'ANONYMOUS', Guest = 'GUEST'"),
    roleDeclarations: input.roleDeclarations.replace("MEMBER = 'member'", "MEMBER = 'member', ANONYMOUS = 'anonymous', GUEST = 'guest'"),
  });
  assert.doesNotMatch(result, /Anonymous =|Guest =/);
  assert.match(result, /Member = "member"/);
});

test('the legacy module keeps one generated vocabulary export and is idempotent', () => {
  const source = input.clientDeclarations + "\nexport type Other = string;\n";
  const rewritten = rewriteLegacyModule(source, '../generated-v2/legacy-vocabulary');
  assert.match(rewritten, /import type \{ LicenseEntitlementType, RoleName \}/);
  assert.match(rewritten, /export type Other = string/);
  assert.doesNotMatch(rewritten, /export enum RoleName/);
  assert.equal(rewriteLegacyModule(rewritten, '../generated-v2/legacy-vocabulary'), rewritten);
  const stale = "import { RoleName, LicenseEntitlementType } from '../generated-v2/legacy-vocabulary';\nexport { RoleName, LicenseEntitlementType } from '../generated-v2/legacy-vocabulary';\nexport type Other = string;\n";
  assert.equal(rewriteLegacyModule(stale, '../generated-v2/legacy-vocabulary'), rewritten);
});
