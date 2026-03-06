import { RoleName } from '@/core/apollo/generated/graphql-schema';

export interface InviteContributorsData {
  welcomeMessage: string;
  extraRoles?: RoleName[];
  invitedContributorIds: string[];
  invitedUserEmails: string[];
}
