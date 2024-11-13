import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../../common/tags/tagset.constants';
import {
  AuthorizationPrivilege,
  MyPrivilegesFragment,
  SpaceLevel,
  UserDetailsFragment,
} from '@core/apollo/generated/graphql-schema';
import { Identifiable } from '@core/utils/Identifiable';

export interface PendingApplication extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    profile: {
      displayName: string;
      tagline?: string;
      url: string;
    };
  };
  application: {
    createdDate: Date | string;
    state?: string;
  };
}

export interface UserMetadata {
  user: UserDetailsFragment;
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean | undefined;
  keywords: string[];
  skills: string[];
}

export const toUserMetadata = (
  user: UserDetailsFragment | undefined,
  platformLevelAuthorization: MyPrivilegesFragment | undefined
): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const myPrivileges = platformLevelAuthorization?.myPrivileges;

  const hasPlatformPrivilege = (privilege: AuthorizationPrivilege) => {
    return myPrivileges?.includes(privilege);
  };

  return {
    user,
    hasPlatformPrivilege: hasPlatformPrivilege,
    keywords: user.profile.tagsets?.find(t => t.name.toLowerCase() === KEYWORDS_TAGSET)?.tags ?? [],
    skills: user.profile.tagsets?.find(t => t.name.toLowerCase() === SKILLS_TAGSET)?.tags ?? [],
  };
};
