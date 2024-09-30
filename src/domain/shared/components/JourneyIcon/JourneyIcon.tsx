import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import { SubspaceIcon } from '../../../journey/subspace/icon/SubspaceIcon';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';
import { SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

/**
 * @deprecated
 */
const journeyIcon = {
  space: SpaceIcon,
  subspace: SubspaceIcon,
  subsubspace: OpportunityIcon,
} as const;

export const journeyIconByJourneyLevel = [
  SpaceIcon,
  SubspaceIcon,
  OpportunityIcon,
  undefined, // for Typescript to correctly assume you can get undefined as well
] as const;

export const spaceTypeIcon: Record<SpaceType, ComponentType<SvgIconProps>> = {
  [SpaceType.Space]: SpaceIcon,
  [SpaceType.Challenge]: SubspaceIcon,
  [SpaceType.Opportunity]: OpportunityIcon,
  // TODO icons below to be defined
  [SpaceType.BlankSlate]: SpaceIcon,
  [SpaceType.Knowledge]: SpaceIcon,
};

export default journeyIcon;
