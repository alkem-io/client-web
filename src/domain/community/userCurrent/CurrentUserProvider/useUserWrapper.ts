import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface UserWrapper {
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean | undefined;
}

export const toUserWrapper = (
  platformAuthorizationPrivileges: AuthorizationPrivilege[] | undefined
): UserWrapper | undefined => {
  const hasPlatformPrivilege = (privilege: AuthorizationPrivilege) => {
    return platformAuthorizationPrivileges?.includes(privilege);
  };

  return {
    hasPlatformPrivilege,
  };
};
