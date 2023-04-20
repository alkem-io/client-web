import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { HubIcon } from '../../../challenge/hub/icon/HubIcon';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../challenge/opportunity/icon/OpportunityIcon';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

const journeyIcon: Record<JourneyTypeName, ComponentType<SvgIconProps>> = {
  hub: HubIcon,
  challenge: ChallengeIcon,
  opportunity: OpportunityIcon,
};

export default journeyIcon;
