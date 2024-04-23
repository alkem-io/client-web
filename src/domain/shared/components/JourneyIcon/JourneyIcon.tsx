import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import { ChallengeIcon } from '../../../journey/subspace/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';
import { SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

/**
 * @deprecated
 */
const journeyIcon = {
  space: SpaceIcon,
  subspace: ChallengeIcon,
  subsubspace: OpportunityIcon,
} as const;

export const journeyIconByJourneyLevel = [SpaceIcon, ChallengeIcon, OpportunityIcon] as const;

export const spaceTypeIcon: Record<SpaceType, ComponentType<SvgIconProps>> = {
  [SpaceType.Space]: SpaceIcon,
  [SpaceType.Challenge]: ChallengeIcon,
  [SpaceType.Opportunity]: OpportunityIcon,
};

export default journeyIcon;
