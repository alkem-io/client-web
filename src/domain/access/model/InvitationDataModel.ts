import { RoleName } from '@/core/apollo/generated/graphql-schema';

export interface InviteContributorsData {
  welcomeMessage: string;
  extraRoles?: RoleName[];
  invitedActorIds: string[];
  invitedUserEmails: string[];
}
