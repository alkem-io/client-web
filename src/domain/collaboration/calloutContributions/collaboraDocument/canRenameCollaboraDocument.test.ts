import { describe, expect, test } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canRenameCollaboraDocument } from './canRenameCollaboraDocument';

const U = [AuthorizationPrivilege.Update];
const R = [AuthorizationPrivilege.Read];

describe('canRenameCollaboraDocument', () => {
  test.each([
    ['document Update only', U, R, true],
    ['callout Update only', R, U, true],
    ['both Update', U, U, true],
    ['neither Update', R, R, false],
    ['document undefined, callout Update', undefined, U, true],
    ['both undefined', undefined, undefined, false],
  ])('%s', (_label, documentPrivileges, calloutPrivileges, expected) => {
    expect(canRenameCollaboraDocument({ documentPrivileges, calloutPrivileges })).toBe(expected);
  });
});
