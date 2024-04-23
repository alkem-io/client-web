import {
  ChallengePreferenceType,
  SpacePreferenceType,
  OrganizationPreferenceType,
  UserPreferenceType,
} from '../../../core/apollo/generated/graphql-schema';

export type PreferenceTypes =
  | UserPreferenceType
  | OrganizationPreferenceType
  | ChallengePreferenceType
  | SpacePreferenceType;
