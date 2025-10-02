import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import { AnyContribution } from './AnyContributionType';

export interface CalloutContributionCardComponentProps {
  contribution: AnyContribution;
  callout: CalloutDetailsModelExtended;
  selected?: boolean;
  onClick?: () => void;
  columns?: number;
}
