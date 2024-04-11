import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import { ChallengeIcon } from '../../../journey/subspace/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';

const journeyIcon = {
  space: SpaceIcon,
  subspace: ChallengeIcon,
  subsubspace: OpportunityIcon,
} as const;

export default journeyIcon;
