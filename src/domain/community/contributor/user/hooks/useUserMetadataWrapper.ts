import { useCallback } from 'react';
import { useCredentialsResolver } from '../../../../common/credential/useCredentialsResolver';
import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../../../common/tags/tagset.constants';
import { ContributionItem } from '../../contribution';
import {
  AuthorizationCredential,
  UserRolesDetailsFragment,
  MyPrivilegesFragment,
  AuthorizationPrivilege,
  User,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Role } from '../models/Role';

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
  hasCredentials: (credential: AuthorizationCredential, resourceId?: string) => boolean;
  ofChallenge: (id: string) => boolean;
  ofHub: (id: string) => boolean;
  ofOpportunity: (id: string) => boolean;
  /** has an entity admin role, i.e. is admin of a community */
  isCommunityAdmin: boolean;
  isOrganizationAdmin: boolean;
  roles: Role[];
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

const getDisplayName = (i: { displayName?: string }) => i.displayName || ';';

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

export const useUserMetadataWrapper = () => {
  const resolver = useCredentialsResolver();

  const toUserMetadata = useCallback(
    (
      user: User | undefined,
      membershipData: UserRolesDetailsFragment | undefined,
      platformLevelAuthorization: MyPrivilegesFragment | undefined
    ): UserMetadata | undefined => {
      if (!user) {
        return;
      }

      const challenges = membershipData?.hubs.flatMap(e => e.challenges.map(getDisplayName)) || [];
      const opportunities = membershipData?.hubs.flatMap(e => e.opportunities.map(getDisplayName)) || [];
      const organizations = membershipData?.organizations.map(getDisplayName) || [];
      const organizationNameIDs: UserMetadata['organizationNameIDs'] =
        membershipData?.organizations.map(o => o.nameID) || [];
      const groups = membershipData?.hubs.flatMap(e => e.userGroups.map(getDisplayName)) || [];

      const roles =
        user?.agent?.credentials
          ?.map(c => {
            return {
              type: c.type,
              name: resolver.toRoleName(c.type),
              order: resolver.toRoleOrder(c.type),
              hidden: resolver.isHidden(c.type),
              resourceId: c.resourceID,
            } as Role;
          })
          .sort((a, b) => a.order - b.order) || [];

      const hasCredentials = (credential: AuthorizationCredential, resourceId?: string) =>
        user?.agent?.credentials?.some(c => c.type === credential && (!resourceId || c.resourceID === resourceId)) ??
        false;

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

      const metadata: UserMetadata = {
        user,
        hasCredentials,
        ofChallenge: (id: string) => hasCredentials(AuthorizationCredential.ChallengeMember, id),
        ofHub: (id: string) => hasCredentials(AuthorizationCredential.HubMember, id),
        ofOpportunity: (id: string) => hasCredentials(AuthorizationCredential.OpportunityMember, id),
        isCommunityAdmin: false,
        isOrganizationAdmin: false,
        roles,
        groups,
        challenges,
        opportunities,
        organizations,
        keywords: user.profile?.tagsets?.find(t => t.name.toLowerCase() === KEYWORDS_TAGSET)?.tags || [],
        skills: user.profile?.tagsets?.find(t => t.name.toLowerCase() === SKILLS_TAGSET)?.tags || [],
        contributions: getContributions(membershipData),
        pendingApplications: getPendingApplications(membershipData),
        organizationNameIDs: organizationNameIDs,
        permissions: permissions,
      };

      metadata.isCommunityAdmin = hasCommunityAdminRole(metadata.roles);
      metadata.isOrganizationAdmin = metadata.roles.some(
        ({ type }) => type === AuthorizationCredential.OrganizationAdmin
      );

      return metadata;
    },
    [resolver]
  );

  return toUserMetadata;
};

export const hasCommunityAdminRole = (roles: Role[]) => roles.some(({ type }) => CommunityAdminRoles.includes(type));

const CommunityAdminRoles = [
  AuthorizationCredential.ChallengeAdmin,
  AuthorizationCredential.HubAdmin,
  AuthorizationCredential.OpportunityAdmin,
];
