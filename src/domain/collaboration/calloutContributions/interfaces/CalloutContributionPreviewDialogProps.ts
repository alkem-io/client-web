import CalloutContributionModel from '../CalloutContributionModel';

/**
 * Properties that a Preview Dialog component must receive
 */
export interface CalloutContributionPreviewDialogProps {
  calloutsSetId: string | undefined;
  calloutId: string | undefined;
  contribution: CalloutContributionModel | undefined;
  onCalloutUpdate?: () => Promise<unknown>;
  open: boolean;
  onClose: () => void;
}
