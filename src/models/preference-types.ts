import {
  ChallengePreferenceType,
  HubPreferenceType,
  OrganizationPreferenceType,
  UserPreferenceType,
} from './graphql-schema';

export type PreferenceTypes =
  | UserPreferenceType
  | OrganizationPreferenceType
  | ChallengePreferenceType
  | HubPreferenceType;
