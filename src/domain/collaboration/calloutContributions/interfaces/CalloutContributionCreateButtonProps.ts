import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';

/**
 * Properties that a Create Contribution Button must receive
 */
export interface CalloutContributionCreateButtonProps {
  canCreateContribution: boolean;
  callout: CalloutDetailsModelExtended;
  calloutRestrictions?: CalloutRestrictions;
  onContributionCreated?: () => Promise<unknown>;
}
