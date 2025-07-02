import { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { CalloutRestrictions as CalloutRestrictions } from './CalloutDialogs/CreateCalloutDialog';
import { Identifiable } from '@/core/utils/Identifiable';
import { CalloutSortEvents, CalloutSortProps } from '../calloutsSet/CalloutsView/CalloutSortModels';

export interface CalloutLayoutEvents extends Partial<CalloutSortEvents> {
  onVisibilityChange?: (
    callout: Identifiable,
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void> | undefined;
  onCalloutDelete?: (callout: Identifiable) => Promise<void> | undefined;
}

export interface BaseCalloutViewProps extends CalloutLayoutEvents, Partial<CalloutSortProps> {
  contributionsCount: number | undefined;
  loading?: boolean;
  canCreateContribution?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  onCalloutUpdate?: () => Promise<unknown> | void;
  calloutRestrictions?: CalloutRestrictions;
}
