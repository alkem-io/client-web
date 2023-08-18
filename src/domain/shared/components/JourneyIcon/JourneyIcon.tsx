import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import { ChallengeIcon } from '../../../journey/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';

const journeyIcon = {
  space: SpaceIcon,
  challenge: ChallengeIcon,
  opportunity: OpportunityIcon,
} as const;

export default journeyIcon;
