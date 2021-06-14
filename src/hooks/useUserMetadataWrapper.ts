import { useCallback } from 'react';
import { Role } from '../models/Role';
import { AuthorizationCredential, Membership, User } from '../types/graphql-schema';
import { useCredentialsResolver } from './useCredentialsResolver';

export interface UserMetadata {
  user: User;
  hasCredentials: (credential: AuthorizationCredential, resourceId?: string) => boolean;
  ofChallenge: (id: string) => boolean;
  isAdmin: boolean;
  roles: Role[];
  groups: string[];
  organizations: string[];
  opportunities: string[];
  challenges: string[];
  ecoverses: string[];
}

const getDisplayName = (i: { displayName?: string }) => i.displayName || ';';

export const useUserMetadataWrapper = () => {
  const resolver = useCredentialsResolver();

  const toUserMetadata = useCallback(
    (user: User | undefined, membershipData?: Membership): UserMetadata | undefined => {
      if (!user) {
        return;
      }
      const ecoverses = membershipData?.ecoverses.map(getDisplayName) || [];
      const challenges = membershipData?.ecoverses.flatMap(e => e.challenges.map(getDisplayName)) || [];
      const opportunities = [];
      const organizations = membershipData?.organisations.map(getDisplayName) || [];
      const groups = membershipData?.ecoverses.flatMap(e => e.userGroups.map(getDisplayName)) || [];

      const roles =
        user?.agent?.credentials
          ?.map(c => {
            return {
              type: c.type,
              name: resolver.toRoleName(c.type),
              order: resolver.toRoleOrder(c.type),
              resourceId: c.resourceID,
            } as Role;
          })
          .sort((a, b) => a.order - b.order) || [];
      const metadata = {
        user,
        hasCredentials: (credential: AuthorizationCredential, resourceId = '') => {
          return Boolean(
            user?.agent?.credentials?.findIndex(c => c.type === credential && c.resourceID === resourceId) !== -1
          );
        },
        ofChallenge: (id: string) =>
          Boolean(
            user?.agent?.credentials?.findIndex(
              c => c.type === AuthorizationCredential.UserGroupMember && c.resourceID === id
            ) !== -1
          ),
        isAdmin: false,
        roles,
        groups,
        challenges,
        opportunities,
        organizations,
        ecoverses,
      };

      metadata.isAdmin = metadata.roles.findIndex(c => c.type === AuthorizationCredential.GlobalAdmin) !== -1;

      return metadata;
    },
    [resolver]
  );
  return toUserMetadata;
};
