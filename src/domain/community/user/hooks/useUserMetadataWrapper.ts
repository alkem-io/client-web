import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../../common/tags/tagset.constants';
import {
  ApplicationForRoleResult,
  AuthorizationPrivilege,
  InvitationForRoleResult,
  MyPrivilegesFragment,
  UserDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { InvitationItem } from '../providers/UserProvider/InvitationItem';
import { Stateful } from '../../../shared/types/Stateful';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { JourneyLevel } from '../../../../main/routing/resolvers/RouteResolver';

export interface PendingApplication extends Identifiable, Stateful {
  spaceID: string;
  spaceLevel: JourneyLevel;
}

export interface UserMetadata {
  user: UserDetailsFragment;
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean | undefined;
  keywords: string[];
  skills: string[];
  pendingApplications: PendingApplication[];
  pendingInvitations: InvitationItem[];
}

export const getPendingApplications = (applicationsData: ApplicationForRoleResult[]) => {
  return (
    applicationsData.map<PendingApplication>(application => ({
      ...application,
      spaceLevel: application.spaceLevel as JourneyLevel,
    })) || []
  );
};

const getPendingInvitations = (invitationsData: InvitationForRoleResult[]) => {
  return (
    invitationsData.map<InvitationItem>(invitation => ({
      ...invitation,
      spaceLevel: invitation.spaceLevel as JourneyLevel,
    })) || []
  );
};

export const toUserMetadata = (
  user: UserDetailsFragment | undefined,
  applications: ApplicationForRoleResult[],
  invitations: InvitationForRoleResult[],
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
    pendingApplications: getPendingApplications(applications),
    pendingInvitations: getPendingInvitations(invitations),
  };
};
