import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { kebabToConstantCase } from '@/core/utils/string';
import enJson from './common.en.json';

// Completeness check for the role-vocabulary fallback the in-app mapper relies on
// (`common.roles.<KEY>`, spec FR-016): every role the server can name in a role-change
// notification must have a translated label, so the mapper's humanized fallback is only
// ever exercised by a role added after this list, never by one already known.
describe('common.roles completeness over RoleName', () => {
  const roles = enJson.common.roles as Record<string, string>;

  it.each(Object.values(RoleName))('has a non-empty label for RoleName.%s', roleName => {
    const key = kebabToConstantCase(roleName);
    expect(roles[key], `missing common.roles.${key} for RoleName "${roleName}"`).toBeTruthy();
  });
});
