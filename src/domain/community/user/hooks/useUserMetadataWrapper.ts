import {
  AuthorizationPrivilege,
  RoleName,
  SpaceLevel,
  TagsetReservedName,
  UserDetailsFragment,
} from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface PendingApplication extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutMinimalUrlModel;
  };
  application: {
    createdDate: Date | string;
    state?: string;
  };
}

export interface UserMetadata {
  user: UserDetailsFragment;
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean | undefined;
  hasPlatformRole: (role: RoleName) => boolean | undefined;
  keywords: string[];
  skills: string[];
}

export const toUserMetadata = (
  user: UserDetailsFragment | undefined,
  platformAuthorizationPrivileges: AuthorizationPrivilege[] | undefined,
  myRoles: RoleName[] | undefined
): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const hasPlatformPrivilege = (privilege: AuthorizationPrivilege) => {
    return platformAuthorizationPrivileges?.includes(privilege);
  };

  const hasPlatformRole = (role: RoleName) => {
    return myRoles?.includes(role);
  };

  return {
    user,
    hasPlatformPrivilege,
    hasPlatformRole,
    keywords:
      user.profile.tagsets?.find(t => t.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase())?.tags ?? [],
    skills:
      user.profile.tagsets?.find(t => t.name.toLowerCase() === TagsetReservedName.Skills.toLowerCase())?.tags ?? [],
  };
};
