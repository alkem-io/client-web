import { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { CalloutSortEvents, CalloutSortProps } from '../calloutsSet/CalloutsView/CalloutSortModels';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import { CalloutDetailsModelExtended } from './models/CalloutDetailsModel';

export interface CalloutLayoutEvents extends Partial<CalloutSortEvents> {
  onVisibilityChange?: (
    callout: Identifiable,
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void> | undefined;
  onCalloutDelete?: (callout: Identifiable) => Promise<void> | undefined;
}

export interface BaseCalloutViewProps extends CalloutLayoutEvents, Partial<CalloutSortProps> {
  callout: CalloutDetailsModelExtended;
  onCalloutUpdate?: () => Promise<unknown>;
  expanded?: boolean;
  onExpand?: (callout: CalloutDetailsModelExtended) => void;
  onCollapse?: () => void;
  loading?: boolean;
  calloutRestrictions?: CalloutRestrictions;
}
