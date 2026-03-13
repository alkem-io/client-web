import type { RefObject } from 'react';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type CalloutContributionModel from '../CalloutContributionModel';

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
