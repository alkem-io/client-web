import { AuthorizationPrivilege, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { UserModel } from '../../user/models/UserModel';

export interface UserMetadata {
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean | undefined;
  keywords: string[];
  skills: string[];
}

export const toUserMetadata = (
  user: UserModel | undefined,
  platformAuthorizationPrivileges: AuthorizationPrivilege[] | undefined
): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const hasPlatformPrivilege = (privilege: AuthorizationPrivilege) => {
    return platformAuthorizationPrivileges?.includes(privilege);
  };

  return {
    hasPlatformPrivilege,
    keywords:
      user.profile.tagsets?.find(t => t.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase())?.tags ?? [],
    skills:
      user.profile.tagsets?.find(t => t.name.toLowerCase() === TagsetReservedName.Skills.toLowerCase())?.tags ?? [],
  };
};
