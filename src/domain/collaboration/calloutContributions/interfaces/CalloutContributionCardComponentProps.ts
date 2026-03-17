import type { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import type { AnyContribution } from './AnyContributionType';

export interface CalloutContributionCardComponentProps {
  contribution: AnyContribution;
  callout: CalloutDetailsModelExtended;
  selected?: boolean;
  onClick?: () => void;
  columns?: number;
}
