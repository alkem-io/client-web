import type { SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import { SpaceL1Icon } from '@/domain/space/icons/SpaceL1Icon';
import { SpaceL2Icon } from '@/domain/space/icons/SpaceL2Icon';

export const spaceLevelIcon: Record<SpaceLevel, ComponentType<SvgIconProps>> = {
  [SpaceLevel.L0]: SpaceL0Icon,
  [SpaceLevel.L1]: SpaceL1Icon,
  [SpaceLevel.L2]: SpaceL2Icon,
};
