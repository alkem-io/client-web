import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '@/domain/common/tags/tagset.constants';
import {
  AuthorizationPrivilege,
  MyPrivilegesFragment,
  RoleName,
  SpaceLevel,
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
  platformLevelAuthorization: MyPrivilegesFragment | undefined,
  myRoles: RoleName[] | undefined
): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const myPrivileges = platformLevelAuthorization?.myPrivileges;

  const hasPlatformPrivilege = (privilege: AuthorizationPrivilege) => {
    return myPrivileges?.includes(privilege);
  };

  const hasPlatformRole = (role: RoleName) => {
    return myRoles?.includes(role);
  };

  return {
    user,
    hasPlatformPrivilege,
    hasPlatformRole,
    keywords: user.profile.tagsets?.find(t => t.name.toLowerCase() === KEYWORDS_TAGSET)?.tags ?? [],
    skills: user.profile.tagsets?.find(t => t.name.toLowerCase() === SKILLS_TAGSET)?.tags ?? [],
  };
};
