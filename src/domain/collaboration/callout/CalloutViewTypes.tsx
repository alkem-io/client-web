import type { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import type { CalloutSortEvents, CalloutSortProps } from '../calloutsSet/CalloutsView/CalloutSortModels';
import type { CalloutDetailsModelExtended } from './models/CalloutDetailsModel';

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
