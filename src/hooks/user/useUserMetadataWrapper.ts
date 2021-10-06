import { useCallback } from 'react';
import { Role } from '../../models/Role';
import { AuthorizationCredential, User, UserMembershipDetailsFragment } from '../../models/graphql-schema';
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
  roles: Role[];
  groups: string[];
  organizations: string[];
  opportunities: string[];
  challenges: string[];
  ecoverses: string[];
  communities: Record<string, string>;
}

const getDisplayName = (i: { displayName?: string }) => i.displayName || ';';

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

      const metadata = {
        user,
        hasCredentials,
        ofChallenge: (id: string) => hasCredentials(AuthorizationCredential.ChallengeMember, id),
        ofEcoverse: (id: string) => hasCredentials(AuthorizationCredential.EcoverseMember, id),
        isEcoverseAdmin,
        isChallengeAdmin,
        isOpportunityAdmin,
        isAdmin: false,
        roles,
        groups,
        challenges,
        opportunities,
        organizations,
        ecoverses,
        communities,
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
