import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export enum CalloutGroupNameValuesMap {
  HomeLeft = 'HOME_1',
  HomeRight = 'HOME_2',
  ContributeLeft = 'CONTRIBUTE_1',
  ContributeRight = 'CONTRIBUTE_2',
  CommunityLeft = 'COMMUNITY_1',
  CommunityRight = 'COMMUNITY_2',
  SubspacesLeft = 'SUBSPACES_1',
  SubspacesRight = 'SUBSPACES_2',
  Knowledge = 'KNOWLEDGE',
}

export const JourneyCalloutGroupNameOptions: Record<JourneyTypeName, CalloutGroupName[]> = {
  space: [
    CalloutGroupName.HomeLeft,
    CalloutGroupName.HomeRight,
    CalloutGroupName.CommunityLeft,
    CalloutGroupName.CommunityRight,
    CalloutGroupName.SubspacesLeft,
    CalloutGroupName.SubspacesRight,
    CalloutGroupName.Knowledge,
  ],
  challenge: [
    CalloutGroupName.HomeLeft,
    CalloutGroupName.HomeRight,
    CalloutGroupName.ContributeLeft,
    CalloutGroupName.ContributeRight,
    CalloutGroupName.SubspacesLeft,
    CalloutGroupName.SubspacesRight,
  ],
  opportunity: [
    CalloutGroupName.HomeLeft,
    CalloutGroupName.HomeRight,
    CalloutGroupName.ContributeLeft,
    CalloutGroupName.ContributeRight,
  ],
};
