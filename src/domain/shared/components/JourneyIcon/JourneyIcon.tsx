import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { SpaceIcon } from '../../../challenge/space/icon/SpaceIcon';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../challenge/opportunity/icon/OpportunityIcon';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

const journeyIcon: Record<JourneyTypeName, ComponentType<SvgIconProps>> = {
  space: SpaceIcon,
  challenge: ChallengeIcon,
  opportunity: OpportunityIcon,
};

export default journeyIcon;
