import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../../common/tags/tagset.constants';
import { ContributionItem } from '../contribution';
import {
  ApplicationForRoleResult,
  AuthorizationPrivilege,
  InvitationForRoleResult,
  MyPrivilegesFragment,
  UserDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { InvitationItem } from '../providers/UserProvider/InvitationItem';
import { Stateful } from '../../../shared/types/Stateful';

export interface PendingApplication extends ContributionItem, Stateful {}

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
    applicationsData.map<PendingApplication>(a => ({
      spaceId: a.spaceID,
      subspaceId: a.subspaceID,
      subsubspaceId: a.subsubspaceID,
      id: a.id,
      state: a.state,
    })) || []
  );
};

const getPendingInvitations = (invitationsData: InvitationForRoleResult[]) => {
  return (
    invitationsData.map<InvitationItem>(a => ({
      spaceId: a.spaceID,
      subspaceId: a.subspaceID,
      subsubspaceId: a.subsubspaceID,
      welcomeMessage: a.welcomeMessage || '',
      createdBy: a.createdBy,
      createdDate: a.createdDate,
      id: a.id,
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
