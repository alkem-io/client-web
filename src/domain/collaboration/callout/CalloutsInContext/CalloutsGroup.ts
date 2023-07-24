import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';

export enum CalloutDisplayLocationValuesMap {
  HomeTop = 'HOME_0',
  HomeLeft = 'HOME_1',
  HomeRight = 'HOME_2',
  ContributeLeft = 'CONTRIBUTE_1',
  ContributeRight = 'CONTRIBUTE_2',
  CommunityLeft = 'COMMUNITY_1',
  CommunityRight = 'COMMUNITY_2',
  ChallengesLeft = 'CHALLENGES_1',
  ChallengesRight = 'CHALLENGES_2',
  OpportunitiesLeft = 'OPPORTUNITIES_1',
  OpportunitiesRight = 'OPPORTUNITIES_2',
  Knowledge = 'KNOWLEDGE',
}

export const SpaceDisplayLocationOptions = [
  CalloutDisplayLocation.HomeTop,
  CalloutDisplayLocation.HomeLeft,
  CalloutDisplayLocation.HomeRight,
  CalloutDisplayLocation.CommunityLeft,
  CalloutDisplayLocation.CommunityRight,
  CalloutDisplayLocation.ChallengesLeft,
  CalloutDisplayLocation.ChallengesRight,
  CalloutDisplayLocation.Knowledge,
];
export const ChallengeDisplayLocationOptions = [
  CalloutDisplayLocation.HomeTop,
  CalloutDisplayLocation.HomeLeft,
  CalloutDisplayLocation.HomeRight,
  CalloutDisplayLocation.ContributeLeft,
  CalloutDisplayLocation.ContributeRight,
  CalloutDisplayLocation.OpportunitiesLeft,
  CalloutDisplayLocation.OpportunitiesRight,
];
export const OpportunityDisplayLocationOptions = [
  CalloutDisplayLocation.HomeTop,
  CalloutDisplayLocation.HomeLeft,
  CalloutDisplayLocation.HomeRight,
  CalloutDisplayLocation.ContributeLeft,
  CalloutDisplayLocation.ContributeRight,
];
