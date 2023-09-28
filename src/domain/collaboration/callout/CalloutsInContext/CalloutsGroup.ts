import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export enum CalloutDisplayLocationValuesMap {
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

export const JourneyCalloutDisplayLocationOptions: Record<JourneyTypeName, CalloutDisplayLocation[]> = {
  space: [
    CalloutDisplayLocation.HomeLeft,
    CalloutDisplayLocation.HomeRight,
    CalloutDisplayLocation.CommunityLeft,
    CalloutDisplayLocation.CommunityRight,
    CalloutDisplayLocation.ChallengesLeft,
    CalloutDisplayLocation.ChallengesRight,
    CalloutDisplayLocation.Knowledge,
  ],
  challenge: [
    CalloutDisplayLocation.HomeLeft,
    CalloutDisplayLocation.HomeRight,
    CalloutDisplayLocation.ContributeLeft,
    CalloutDisplayLocation.ContributeRight,
    CalloutDisplayLocation.OpportunitiesLeft,
    CalloutDisplayLocation.OpportunitiesRight,
  ],
  opportunity: [
    CalloutDisplayLocation.HomeLeft,
    CalloutDisplayLocation.HomeRight,
    CalloutDisplayLocation.ContributeLeft,
    CalloutDisplayLocation.ContributeRight,
  ],
};
