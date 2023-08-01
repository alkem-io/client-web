import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../../../common/tags/tagset.constants';
import { ContributionItem } from '../../contribution';
import {
  ApplicationForRoleResult,
  AuthorizationPrivilege,
  InvitationForRoleResult,
  MyPrivilegesFragment,
  User,
  UserRolesDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import { RoleType } from '../constants/RoleType';

export interface UserMetadata {
  user: User;
  hasPlatformPrivilege: (privilege: AuthorizationPrivilege) => boolean;
  ofChallenge: (id: string) => boolean;
  ofSpace: (id: string) => boolean;
  ofOpportunity: (id: string) => boolean;
  groups: string[];
  organizations: string[];
  opportunities: string[];
  challenges: string[];
  keywords: string[];
  skills: string[];
  contributions: ContributionItem[];
  pendingApplications: ContributionItem[];
  pendingInvitations: ContributionItem[];
  organizationNameIDs: string[];
}

const getDisplayName = (i: { displayName: string }) => i.displayName;

const getContributions = (membershipData?: UserRolesDetailsFragment) => {
  if (!membershipData) return [];

  const spaces = membershipData.spaces.map<ContributionItem>(e => ({
    spaceId: e.spaceID,
  }));

  const challenges = membershipData.spaces.flatMap<ContributionItem>(e =>
    e.challenges.map(c => ({
      spaceId: e.nameID,
      challengeId: c.nameID,
    }))
  );

  const opportunities = membershipData.spaces.flatMap<ContributionItem>(e =>
    e.opportunities.map(o => ({
      spaceId: e.nameID,
      opportunityId: o.nameID,
    }))
  );
  return [...spaces, ...challenges, ...opportunities];
};

const getPendingApplications = (applicationsData: ApplicationForRoleResult[]) => {
  return (
    applicationsData.map<ContributionItem>(a => ({
      spaceId: a.spaceID,
      challengeId: a.challengeID,
      opportunityId: a.opportunityID,
    })) || []
  );
};

const getPendingInvitations = (invitationsData: InvitationForRoleResult[]) => {
  return (
    invitationsData.map<ContributionItem>(a => ({
      spaceId: a.spaceID,
      challengeId: a.challengeID,
      opportunityId: a.opportunityID,
    })) || []
  );
};

export const toUserMetadata = (
  user: Omit<User, 'agent'> | undefined,
  applications: ApplicationForRoleResult[],
  invitations: InvitationForRoleResult[],
  membershipData: UserRolesDetailsFragment | undefined,
  platformLevelAuthorization: MyPrivilegesFragment | undefined
): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const spaceMemberships = membershipData?.spaces.map(({ challenges, opportunities, ...space }) => space) ?? [];
  const challengeMemberships = membershipData?.spaces.flatMap(e => e.challenges) ?? [];
  const opportunityMemberships = membershipData?.spaces.flatMap(e => e.opportunities) ?? [];

  const IsJourneyMember = (memberships: { id: string; roles: string[] }[]) => (journeyId: string) => {
    return memberships.some(({ id, roles }) => {
      return id === journeyId && roles.includes(RoleType.Member);
    });
  };

  const hasPlatformPrivilege = (myPrivileges: AuthorizationPrivilege[]) => (privilege: AuthorizationPrivilege) => {
    return myPrivileges.includes(privilege);
  };

  const challengeDisplayNames = challengeMemberships.map(getDisplayName);
  const opportunityDisplayNames = opportunityMemberships.map(getDisplayName);
  const organizationDisplayNames = membershipData?.organizations.map(getDisplayName) ?? [];
  const organizationNameIDs = membershipData?.organizations.map(o => o.nameID) ?? [];
  const groups = membershipData?.spaces.flatMap(e => e.userGroups.map(getDisplayName)) || [];

  const myPrivileges = platformLevelAuthorization?.myPrivileges ?? [];

  return {
    user,
    hasPlatformPrivilege: hasPlatformPrivilege(myPrivileges),
    ofChallenge: IsJourneyMember(challengeMemberships),
    ofSpace: IsJourneyMember(spaceMemberships),
    ofOpportunity: IsJourneyMember(opportunityMemberships),
    groups,
    challenges: challengeDisplayNames,
    opportunities: opportunityDisplayNames,
    organizations: organizationDisplayNames,
    keywords: user.profile.tagsets?.find(t => t.name.toLowerCase() === KEYWORDS_TAGSET)?.tags || [],
    skills: user.profile.tagsets?.find(t => t.name.toLowerCase() === SKILLS_TAGSET)?.tags || [],
    contributions: getContributions(membershipData),
    pendingApplications: getPendingApplications(applications),
    pendingInvitations: getPendingInvitations(invitations),
    organizationNameIDs,
  };
};
