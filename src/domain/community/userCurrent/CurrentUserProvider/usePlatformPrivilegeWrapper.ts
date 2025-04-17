import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface PlatformPrivilegeWrapper {
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean | undefined;
}

export const toPlatformPrivilegeWrapper = (
  platformAuthorizationPrivileges: AuthorizationPrivilege[] | undefined
): PlatformPrivilegeWrapper | undefined => {
  const hasPlatformPrivilege = (privilege: AuthorizationPrivilege) => {
    return platformAuthorizationPrivileges?.includes(privilege);
  };

  return {
    hasPlatformPrivilege,
  };
};
