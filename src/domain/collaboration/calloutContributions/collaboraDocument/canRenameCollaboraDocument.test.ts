import { describe, expect, test } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canRenameCollaboraDocument } from './canRenameCollaboraDocument';

const U = [AuthorizationPrivilege.Update];
const C = [AuthorizationPrivilege.UpdateContent];
const R = [AuthorizationPrivilege.Read];

describe('canRenameCollaboraDocument', () => {
  test.each([
    ['document Update only', U, R, true],
    ['callout Update only', R, U, true],
    ['both Update', U, U, true],
    ['neither Update', R, R, false],
    ['document undefined, callout Update', undefined, U, true],
    ['both undefined', undefined, undefined, false],
    // Content editors (UPDATE_CONTENT) do NOT count by default — the manage/menu gate.
    ['content editor only (default)', C, R, false],
  ])('%s', (_label, documentPrivileges, calloutPrivileges, expected) => {
    expect(canRenameCollaboraDocument({ documentPrivileges, calloutPrivileges })).toBe(expected);
  });

  describe('includeContentEditors (editor pencil gate)', () => {
    test('content editor (UPDATE_CONTENT) may rename', () => {
      expect(
        canRenameCollaboraDocument({ documentPrivileges: C, calloutPrivileges: R, includeContentEditors: true })
      ).toBe(true);
    });

    test('still false without any Update / UpdateContent privilege', () => {
      expect(
        canRenameCollaboraDocument({ documentPrivileges: R, calloutPrivileges: R, includeContentEditors: true })
      ).toBe(false);
    });

    test('Update holders are unaffected by the flag', () => {
      expect(
        canRenameCollaboraDocument({ documentPrivileges: U, calloutPrivileges: R, includeContentEditors: true })
      ).toBe(true);
    });
  });
});
