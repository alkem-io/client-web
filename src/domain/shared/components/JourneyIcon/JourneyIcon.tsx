import { SpaceIcon } from '../../../challenge/space/icon/SpaceIcon';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../challenge/opportunity/icon/OpportunityIcon';

const journeyIcon = {
  space: SpaceIcon,
  challenge: ChallengeIcon,
  opportunity: OpportunityIcon,
} as const;

export default journeyIcon;
