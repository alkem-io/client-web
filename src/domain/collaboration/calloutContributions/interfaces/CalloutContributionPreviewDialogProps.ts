import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import CalloutContributionModel from '../CalloutContributionModel';

/**
 * Properties that a CalloutContribution Preview Dialog component must receive
 */
export interface CalloutContributionPreviewDialogProps {
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contribution: CalloutContributionModel | undefined;
  onCalloutUpdate?: () => Promise<unknown>;
  onContributionDeleted: (contributionId: string) => void;
  calloutRestrictions?: CalloutRestrictions;
  open: boolean;
  onClose: () => void;
}
