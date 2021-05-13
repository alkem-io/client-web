import { useCallback } from 'react';
import { Role } from '../models/Role';
import { AuthorizationCredential, User } from '../types/graphql-schema';
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
}

export const useUserMetadataWrapper = () => {
  const resolver = useCredentialsResolver();
  const toUserMetadata = useCallback(
    (user: User | undefined): UserMetadata | undefined => {
      if (!user) {
        return;
      }
      const roles =
        user?.agent?.credentials
          ?.map(
            c =>
              ({
                code: c.type,
                type: resolver.toAuthenticationCredentials(c.type),
                name: resolver.toRoleName(resolver.toAuthenticationCredentials(c.type)),
                order: resolver.toRoleOrder(resolver.toAuthenticationCredentials(c.type)),
                resourceId: c.resourceID,
                resource: 'Resource can not be resolved', // TODO [ATS] Resolve the recource name (User group name, challenge, opportunity ...)
              } as Role)
          )
          .sort((a, b) => a.order - b.order) || [];
      const metadata = {
        user,
        hasCredentials: (credential: AuthorizationCredential, resourceId = -1) =>
          Boolean(
            user?.agent?.credentials?.findIndex(c => c.type === credential && c.resourceID === resourceId) !== -1
          ),
        ofChallenge: (id: string) =>
          Boolean(user?.agent?.credentials?.findIndex(c => c.resourceID === Number(id)) !== -1),
        isAdmin: false,
        roles,
        groups: roles.filter(r => r.type === AuthorizationCredential.UserGroupMember).map(r => r.name) || [],
        challenges: roles.filter(r => r.type === AuthorizationCredential.CommunityMember).map(r => r.resource) || [],
        opportunities: roles.filter(r => r.type === AuthorizationCredential.CommunityMember).map(r => r.resource) || [],
        organizations: [],
      };

      metadata.isAdmin = metadata.roles.findIndex(c => c.type === AuthorizationCredential.GlobalAdmin) !== -1;

      return metadata;
    },
    [resolver]
  );
  return toUserMetadata;
};
