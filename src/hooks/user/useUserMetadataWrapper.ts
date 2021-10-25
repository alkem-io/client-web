import { useCallback } from 'react';
import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../models/constants/tagset.constants';
import { ContributionItem } from '../../models/entities/contribution';
import { AuthorizationCredential, User, UserMembershipDetailsFragment } from '../../models/graphql-schema';
import { Role } from '../../models/Role';
import { useCredentialsResolver } from '../useCredentialsResolver';

export interface UserMetadata {
  user: User;
  hasCredentials: (credential: AuthorizationCredential, resourceId?: string) => boolean;
  ofChallenge: (id: string) => boolean;
  ofEcoverse: (id: string) => boolean;
  isEcoverseAdmin: (ecoverseId: string) => boolean;
  isChallengeAdmin: (ecoverseId: string, challengeId: string) => boolean;
  isOpportunityAdmin: (ecoverseId: string, challengeId: string, opportunityId: string) => boolean;
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  isGlobalAdminCommunity: boolean;
  roles: Role[];
  groups: string[];
  organizations: string[];
  opportunities: string[];
  challenges: string[];
  ecoverses: string[];
  keywords: string[];
  skills: string[];
  communities: Record<string, string>;
  contributions: ContributionItem[];
  pendingApplications: ContributionItem[];
  associatedOrganizations: { nameId: string }[];
}

const getDisplayName = (i: { displayName?: string }) => i.displayName || ';';

const getContributions = (membershipData?: UserMembershipDetailsFragment) => {
  if (!membershipData) return [];

  const ecoverses = membershipData.ecoverses.map<ContributionItem>(e => ({
    ecoverseId: e.ecoverseID,
  }));

  const challenges = membershipData.ecoverses.flatMap<ContributionItem>(e =>
    e.challenges.map(c => ({
      ecoverseId: e.nameID,
      challengeId: c.nameID,
    }))
  );

  const opportunities = membershipData.ecoverses.flatMap<ContributionItem>(e =>
    e.opportunities.map(o => ({
      ecoverseId: e.nameID,
      opportunityId: o.nameID,
    }))
  );
  return [...ecoverses, ...challenges, ...opportunities];
};

const getPendingApplications = (membershipData?: UserMembershipDetailsFragment) => {
  if (!membershipData) return [];

  return (
    membershipData.applications?.map<ContributionItem>(a => ({
      ecoverseId: a.ecoverseID,
      challengeId: a.challengeID,
      opportunityId: a.opportunityID,
    })) || []
  );
};

export const useUserMetadataWrapper = () => {
  const resolver = useCredentialsResolver();

  const toUserMetadata = useCallback(
    (user: User | undefined, membershipData?: UserMembershipDetailsFragment): UserMetadata | undefined => {
      if (!user) {
        return;
      }

      const ecoverses = membershipData?.ecoverses.map(getDisplayName) || [];
      const challenges = membershipData?.ecoverses.flatMap(e => e.challenges.map(getDisplayName)) || [];
      const opportunities = membershipData?.ecoverses.flatMap(e => e.opportunities.map(getDisplayName)) || [];
      const organizations = membershipData?.organizations.map(getDisplayName) || [];
      const associatedOrganizations: UserMetadata['associatedOrganizations'] =
        membershipData?.organizations.map(o => ({ nameId: o.nameID })) || [];
      const groups = membershipData?.ecoverses.flatMap(e => e.userGroups.map(getDisplayName)) || [];
      const communities =
        membershipData?.communities.reduce((aggr, value) => {
          aggr[value.id] = value.displayName;
          return aggr;
        }, {}) || {};

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
        Boolean(
          user?.agent?.credentials?.findIndex(
            c => c.type === credential && (!resourceId || c.resourceID === resourceId)
          ) !== -1
        );

      const isEcoverseAdmin = (id: string) =>
        hasCredentials(AuthorizationCredential.GlobalAdmin) ||
        hasCredentials(AuthorizationCredential.EcoverseAdmin, id);

      const isChallengeAdmin = (ecoverseId: string, challengeId: string) =>
        isEcoverseAdmin(ecoverseId) || hasCredentials(AuthorizationCredential.ChallengeAdmin, challengeId);

      const isOpportunityAdmin = (ecoverseId: string, challengeId: string, opportunityId) =>
        isChallengeAdmin(ecoverseId, challengeId) ||
        hasCredentials(AuthorizationCredential.OpportunityAdmin, opportunityId);

      const metadata: UserMetadata = {
        user,
        hasCredentials,
        ofChallenge: (id: string) => hasCredentials(AuthorizationCredential.ChallengeMember, id),
        ofEcoverse: (id: string) => hasCredentials(AuthorizationCredential.EcoverseMember, id),
        isEcoverseAdmin,
        isChallengeAdmin,
        isOpportunityAdmin,
        isAdmin: false,
        isGlobalAdmin: hasCredentials(AuthorizationCredential.GlobalAdmin),
        isGlobalAdminCommunity: hasCredentials(AuthorizationCredential.GlobalAdminCommunity),
        roles,
        groups,
        challenges,
        opportunities,
        organizations,
        ecoverses,
        communities,
        keywords: user.profile?.tagsets?.find(t => t.name.toLowerCase() === KEYWORDS_TAGSET)?.tags || [],
        skills: user.profile?.tagsets?.find(t => t.name.toLowerCase() === SKILLS_TAGSET)?.tags || [],
        contributions: getContributions(membershipData),
        pendingApplications: getPendingApplications(membershipData),
        associatedOrganizations,
      };

      metadata.isAdmin = hasAdminRole(metadata.roles);

      return metadata;
    },
    [resolver]
  );
  return toUserMetadata;
};

export const hasAdminRole = (roles: Role[]) => {
  for (const role of roles) {
    if (AdminRoles.includes(role.type)) return true;
  }
  return false;
};

export const AdminRoles = [
  AuthorizationCredential.GlobalAdmin,
  AuthorizationCredential.GlobalAdminCommunity,
  AuthorizationCredential.ChallengeAdmin,
  AuthorizationCredential.EcoverseAdmin,
  AuthorizationCredential.OrganizationAdmin,
];
