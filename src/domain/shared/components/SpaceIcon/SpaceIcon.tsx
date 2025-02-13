import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import { SubspaceIcon } from '@/domain/journey/subspace/icon/SubspaceIcon';
import { OpportunityIcon } from '@/domain/journey/opportunity/icon/OpportunityIcon';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

export const spaceIconByLevel = [
  SpaceIcon,
  SubspaceIcon,
  OpportunityIcon,
  undefined, // for Typescript to correctly assume you can get undefined as well
] as const;

const spaceIcon = {
  space: SpaceIcon,
  subspace: SubspaceIcon,
  subsubspace: OpportunityIcon,
  undefined: SpaceIcon,
} as const;
export default spaceIcon;

export const spaceLevelIcon: Record<SpaceLevel, ComponentType<SvgIconProps>> = {
  [SpaceLevel.L0]: SpaceIcon,
  [SpaceLevel.L1]: SubspaceIcon,
  [SpaceLevel.L2]: OpportunityIcon,
};
