import { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import CalloutContributionModel from '../CalloutContributionModel';

/**
 * Properties that a Preview Contribution component must receive
 */
export interface CalloutContributionPreviewComponentProps {
  callout: CalloutDetailsModelExtended;
  contribution: CalloutContributionModel | undefined;
  onOpenContribution: () => void;
  loading?: boolean;
}
