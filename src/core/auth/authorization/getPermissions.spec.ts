import { AuthorizationPrivilege } from '../../apollo/generated/graphql-schema';
import getPermissions from './getPermissions';

const myPrivilegesTest = [AuthorizationPrivilege.Admin, AuthorizationPrivilege.CommunityAddMember, AuthorizationPrivilege.Create, AuthorizationPrivilege.CreatePost];

describe('Permissions array parsing', () => {
  test('check empty array', async () => {
    expect(getPermissions({ myPrivileges: [] }, {
      isAdmin: AuthorizationPrivilege.Admin,
      canAddMember: AuthorizationPrivilege.CommunityAddMember,
      canJoin: AuthorizationPrivilege.CommunityJoin,
    })).toEqual({
      isAdmin: false,
      canAddMember: false,
      canJoin: false,
    });
  });

  test('check undefined', async () => {
    expect(getPermissions(undefined, {
      isAdmin: AuthorizationPrivilege.Admin,
      canAddMember: AuthorizationPrivilege.CommunityAddMember,
      canJoin: AuthorizationPrivilege.CommunityJoin,
    })).toEqual({
      isAdmin: false,
      canAddMember: false,
      canJoin: false,
    });
  });
  test('check undefined 2', async () => {
    expect(getPermissions({ myPrivileges: undefined }, {
      isAdmin: AuthorizationPrivilege.Admin,
      canAddMember: AuthorizationPrivilege.CommunityAddMember,
      canJoin: AuthorizationPrivilege.CommunityJoin,
    })).toEqual({
      isAdmin: false,
      canAddMember: false,
      canJoin: false,
    });
  });

  test('myPrivileges', async () => {
    expect(getPermissions({ myPrivileges: myPrivilegesTest }, {
      isAdmin: AuthorizationPrivilege.Admin,
      canAddMember: AuthorizationPrivilege.CommunityAddMember,
      canJoin: AuthorizationPrivilege.CommunityJoin,
      canCreatePost: AuthorizationPrivilege.CreatePost
    })).toEqual({
      isAdmin: true,
      canAddMember: true,
      canJoin: false,
      canCreatePost: true
    });
  });
});