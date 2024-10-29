import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import { SubspaceIcon } from '../../../journey/subspace/icon/SubspaceIcon';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';
import { SpaceLevel } from '../../../../core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

/**
 * @deprecated
 */
const spaceIcon = {
  space: SpaceIcon,
  subspace: SubspaceIcon,
  subsubspace: OpportunityIcon,
  undefined: SpaceIcon,
} as const;

export const spaceIconByLevel = [
  SpaceIcon,
  SubspaceIcon,
  OpportunityIcon,
  undefined, // for Typescript to correctly assume you can get undefined as well
] as const;

export const spaceLevelIcon: Record<SpaceLevel, ComponentType<SvgIconProps>> = {
  [SpaceLevel.Space]: SpaceIcon,
  [SpaceLevel.Challenge]: SubspaceIcon,
  [SpaceLevel.Opportunity]: OpportunityIcon,
  // TODO icons below to be defined
  // [SpaceType.BlankSlate]: SpaceIcon,
  // [SpaceType.Knowledge]: SpaceIcon,
};

export default spaceIcon;
