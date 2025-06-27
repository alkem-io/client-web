import { Callout, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { CalloutRestrictions as CalloutRestrictions } from '../new-callout/CreateCallout/CreateCalloutDialog';
import { Identifiable } from '@/core/utils/Identifiable';

export interface CalloutSortEvents {
  onMoveUp: (calloutId: string) => void;
  onMoveDown: (calloutId: string) => void;
  onMoveToTop: (calloutId: string) => void;
  onMoveToBottom: (calloutId: string) => void;
}

export interface CalloutSortProps {
  topCallout: boolean;
  bottomCallout: boolean;
}

export interface CalloutLayoutEvents extends Partial<CalloutSortEvents> {
  onVisibilityChange?: (
    calloutId: Callout['id'],
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void> | undefined;
  onCalloutEdit?: (callout: Identifiable) => Promise<void> | undefined;
  onCalloutDelete?: (callout: Identifiable) => Promise<void> | undefined;
}

export interface BaseCalloutViewProps extends CalloutLayoutEvents, Partial<CalloutSortProps> {
  contributionsCount: number | undefined;
  loading?: boolean;
  canCreateContribution?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  onCalloutUpdate?: () => void;
  calloutRestrictions?: CalloutRestrictions;
}
