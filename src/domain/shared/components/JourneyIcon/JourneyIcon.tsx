import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { HubIcon } from '../../../challenge/hub/icon/HubIcon';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../challenge/opportunity/icon/OpportunityIcon';

export enum JourneyType {
  Hub = 'hub',
  Challenge = 'challenge',
  Opportunity = 'opportunity',
}

const journeyIcon: Record<JourneyType, ComponentType<SvgIconProps>> = {
  [JourneyType.Hub]: HubIcon,
  [JourneyType.Challenge]: ChallengeIcon,
  [JourneyType.Opportunity]: OpportunityIcon,
};

export default journeyIcon;
