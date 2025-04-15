import { RoleName } from '@/core/apollo/generated/graphql-schema';

export interface InviteContributorsData {
  welcomeMessage: string;
  extraRole?: RoleName;
  invitedContributorIDs: string[];
  invitedUserEmails: string[];
}
