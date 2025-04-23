import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import { SpaceL1Icon } from '@/domain/space/icons/SpaceL1Icon';
import { SpaceL2Icon } from '@/domain/space/icons/SpaceL2Icon';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

const spaceIcon = {
  space: SpaceL0Icon,
  subspace: SpaceL1Icon,
  subsubspace: SpaceL2Icon,
  undefined: SpaceL0Icon,
} as const;
export default spaceIcon;

export const spaceLevelIcon: Record<SpaceLevel, ComponentType<SvgIconProps>> = {
  [SpaceLevel.L0]: SpaceL0Icon,
  [SpaceLevel.L1]: SpaceL1Icon,
  [SpaceLevel.L2]: SpaceL2Icon,
};
