import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../../../common/tags/tagset.constants';
import { ContributionItem } from '../../contribution';
import {
  AuthorizationPrivilege,
  MyPrivilegesFragment,
  User,
  UserRolesDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import { RoleType } from '../constants/RoleType';

export interface UserPermissions {
  canCreate: boolean;
  canGrant: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canReadUsers: boolean;
  canCreateSpace: boolean;
  canCreateOrganization: boolean;
  isPlatformAdmin: boolean; // has any GLOBAL admin privilege
  isAdmin: boolean; // has any admin privilege
  canAccessGuidance: boolean;
}

export interface UserMetadata {
  user: User;
  // hasCredentials: (credential: AuthorizationCredential, resourceId?: string) => boolean;
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
  organizationNameIDs: string[];
  permissions: UserPermissions;
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

const getPendingApplications = (membershipData?: UserRolesDetailsFragment) => {
  if (!membershipData) return [];

  return (
    membershipData.applications?.map<ContributionItem>(a => ({
      spaceId: a.spaceID,
      challengeId: a.challengeID,
      opportunityId: a.opportunityID,
    })) || []
  );
};

export const toUserMetadata = (
  user: Omit<User, 'agent'> | undefined,
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

  const challengeDisplayNames = challengeMemberships.map(getDisplayName);
  const opportunityDisplayNames = opportunityMemberships.map(getDisplayName);
  const organizationDisplayNames = membershipData?.organizations.map(getDisplayName) ?? [];
  const organizationNameIDs = membershipData?.organizations.map(o => o.nameID) ?? [];
  const groups = membershipData?.spaces.flatMap(e => e.userGroups.map(getDisplayName)) || [];

  const myPrivileges = platformLevelAuthorization?.myPrivileges ?? [];
  const permissions: UserPermissions = {
    canRead: myPrivileges.includes(AuthorizationPrivilege.Read),
    canCreate: myPrivileges.includes(AuthorizationPrivilege.Create),
    canGrant: myPrivileges.includes(AuthorizationPrivilege.Grant),
    canDelete: myPrivileges.includes(AuthorizationPrivilege.Delete),
    canUpdate: myPrivileges.includes(AuthorizationPrivilege.Update),
    canCreateSpace: myPrivileges.includes(AuthorizationPrivilege.CreateSpace),
    canCreateOrganization: myPrivileges.includes(AuthorizationPrivilege.CreateOrganization),
    canReadUsers: myPrivileges.includes(AuthorizationPrivilege.ReadUsers),
    isPlatformAdmin: myPrivileges.includes(AuthorizationPrivilege.PlatformAdmin),
    isAdmin: myPrivileges.includes(AuthorizationPrivilege.Admin),
    canAccessGuidance: myPrivileges.includes(AuthorizationPrivilege.AccessInteractiveGuidance),
  };

  return {
    user,
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
    pendingApplications: getPendingApplications(membershipData),
    organizationNameIDs,
    permissions,
  };
};
