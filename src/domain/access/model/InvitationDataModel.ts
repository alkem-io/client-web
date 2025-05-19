import { RoleName } from '@/core/apollo/generated/graphql-schema';

export interface InviteContributorsData {
  welcomeMessage: string;
  extraRole?: RoleName;
  invitedContributorIds: string[];
  invitedUserEmails: string[];
}
