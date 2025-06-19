import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';

//!! probably should be in the server
export enum CalloutFramingType {
  None = 'none',
  Whiteboard = 'whiteboard',
  // Memo = 'memo',
  // Poll = 'poll',
}

export type CalloutStructuredResponseType = 'none' | CalloutContributionType;

//!! probably should be in the server
export enum CalloutAllowedContributors {
  None = 'none',
  Admin = 'admin',
  Members = 'members',
}
