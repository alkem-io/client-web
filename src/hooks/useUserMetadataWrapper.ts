import { useCallback } from 'react';
import { Role } from '../models/Role';
import { AuthorizationCredential, Membership, User } from '../types/graphql-schema';
import { useCredentialsResolver } from './useCredentialsResolver';

export interface UserMetadata {
  user: User;
  hasCredentials: (credential: AuthorizationCredential, resourceId?: number) => boolean;
  ofChallenge: (id: string) => boolean;
  isAdmin: boolean;
  roles: Role[];
  groups: string[];
  organizations: string[];
  opportunities: string[];
  challenges: string[];
  ecoverses: string[];
}

const getName = (i: { name?: string }) => i.name || ';';

export const useUserMetadataWrapper = () => {
  const resolver = useCredentialsResolver();

  const toUserMetadata = useCallback(
    (user: User | undefined, membershipData?: Membership): UserMetadata | undefined => {
      if (!user) {
        return;
      }
      const ecoverses = membershipData?.ecoverses.map(getName) || [];
      const challenges = membershipData?.ecoverses.flatMap(e => e.challenges.map(getName)) || [];
      const opportunities = [];
      const organizations = membershipData?.organisations.map(getName) || [];
      const groups = membershipData?.ecoverses.flatMap(e => e.userGroups.map(getName)) || [];

      const roles =
        user?.agent?.credentials
          ?.map(c => {
            // const resource = resourceResolver(resolver.toAuthenticationCredentials(c.type), c.resourceID.toString());
            return {
              code: c.type,
              type: resolver.toAuthenticationCredentials(c.type),
              name: resolver.toRoleName(resolver.toAuthenticationCredentials(c.type)),
              order: resolver.toRoleOrder(resolver.toAuthenticationCredentials(c.type)),
              resourceId: c.resourceID,
            } as Role;
          })
          .sort((a, b) => a.order - b.order) || [];
      const metadata = {
        user,
        hasCredentials: (credential: AuthorizationCredential, resourceId = -1) => {
          return Boolean(
            user?.agent?.credentials?.findIndex(
              c => resolver.toAuthenticationCredentials(c.type) === credential && c.resourceID === resourceId
            ) !== -1
          );
        },
        ofChallenge: (id: string) =>
          Boolean(
            user?.agent?.credentials?.findIndex(
              c =>
                resolver.toAuthenticationCredentials(c.type) === AuthorizationCredential.CommunityMember &&
                c.resourceID === Number(id)
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
