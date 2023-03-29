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
  canCreateHub: boolean;
  canCreateOrganization: boolean;
  isPlatformAdmin: boolean; // has any GLOBAL admin privilege
  isAdmin: boolean; // has any admin privilege
}

export interface UserMetadata {
  user: User;
  // hasCredentials: (credential: AuthorizationCredential, resourceId?: string) => boolean;
  ofChallenge: (id: string) => boolean;
  ofHub: (id: string) => boolean;
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

  const hubs = membershipData.hubs.map<ContributionItem>(e => ({
    hubId: e.hubID,
  }));

  const challenges = membershipData.hubs.flatMap<ContributionItem>(e =>
    e.challenges.map(c => ({
      hubId: e.nameID,
      challengeId: c.nameID,
    }))
  );

  const opportunities = membershipData.hubs.flatMap<ContributionItem>(e =>
    e.opportunities.map(o => ({
      hubId: e.nameID,
      opportunityId: o.nameID,
    }))
  );
  return [...hubs, ...challenges, ...opportunities];
};

const getPendingApplications = (membershipData?: UserRolesDetailsFragment) => {
  if (!membershipData) return [];

  return (
    membershipData.applications?.map<ContributionItem>(a => ({
      hubId: a.hubID,
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

  const hubMemberships = membershipData?.hubs.map(({ challenges, opportunities, ...hub }) => hub) ?? [];
  const challengeMemberships = membershipData?.hubs.flatMap(e => e.challenges) ?? [];
  const opportunityMemberships = membershipData?.hubs.flatMap(e => e.opportunities) ?? [];

  const IsJourneyMember = (memberships: { id: string; roles: string[] }[]) => (journeyId: string) => {
    return memberships.some(({ id, roles }) => {
      return id === journeyId && roles.includes(RoleType.Member);
    });
  };

  const challengeDisplayNames = challengeMemberships.map(getDisplayName);
  const opportunityDisplayNames = opportunityMemberships.map(getDisplayName);
  const organizationDisplayNames = membershipData?.organizations.map(getDisplayName) ?? [];
  const organizationNameIDs = membershipData?.organizations.map(o => o.nameID) ?? [];
  const groups = membershipData?.hubs.flatMap(e => e.userGroups.map(getDisplayName)) || [];

  const myPrivileges = platformLevelAuthorization?.myPrivileges ?? [];
  const permissions: UserPermissions = {
    canRead: myPrivileges.includes(AuthorizationPrivilege.Read),
    canCreate: myPrivileges.includes(AuthorizationPrivilege.Create),
    canGrant: myPrivileges.includes(AuthorizationPrivilege.Grant),
    canDelete: myPrivileges.includes(AuthorizationPrivilege.Delete),
    canUpdate: myPrivileges.includes(AuthorizationPrivilege.Update),
    canCreateHub: myPrivileges.includes(AuthorizationPrivilege.CreateHub),
    canCreateOrganization: myPrivileges.includes(AuthorizationPrivilege.CreateOrganization),
    canReadUsers: myPrivileges.includes(AuthorizationPrivilege.ReadUsers),
    isPlatformAdmin: myPrivileges.includes(AuthorizationPrivilege.PlatformAdmin),
    isAdmin: myPrivileges.includes(AuthorizationPrivilege.Admin),
  };

  return {
    user,
    ofChallenge: IsJourneyMember(challengeMemberships),
    ofHub: IsJourneyMember(hubMemberships),
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
