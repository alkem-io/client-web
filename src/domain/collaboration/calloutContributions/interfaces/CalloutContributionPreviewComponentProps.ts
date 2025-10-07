import { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import CalloutContributionModel from '../CalloutContributionModel';
import { RefObject } from 'react';

/**
 * Properties that a Preview Contribution component must receive
 */
export interface CalloutContributionPreviewComponentProps {
  callout: CalloutDetailsModelExtended;
  contribution: CalloutContributionModel | undefined;
  onOpenContribution: () => void;
  loading?: boolean;
  extraActionsPortalRef: RefObject<HTMLDivElement | null>;
}
