import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import { ChallengeIcon } from '../../../journey/subspace/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';

/**
 * @deprecated
 */
const journeyIcon = {
  space: SpaceIcon,
  subspace: ChallengeIcon,
  subsubspace: OpportunityIcon,
} as const;

export const legacyJourneyIcons = [SpaceIcon, ChallengeIcon, OpportunityIcon] as const;

export default journeyIcon;
