import {
  ChallengePreferenceType,
  HubPreferenceType,
  OrganizationPreferenceType,
  UserPreferenceType,
} from '../../../core/apollo/generated/graphql-schema';

export type PreferenceTypes =
  | UserPreferenceType
  | OrganizationPreferenceType
  | ChallengePreferenceType
  | HubPreferenceType;
