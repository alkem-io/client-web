import { Callout, CalloutVisibility } from '../../../core/apollo/generated/graphql-schema';
import { CalloutDeleteType, CalloutEditType } from './edit/CalloutEditType';
import { CoreEntityIdTypes } from '../../shared/types/CoreEntityIds';

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
  onVisibilityChange: (
    calloutId: Callout['id'],
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  onCalloutDelete: (callout: CalloutDeleteType) => Promise<void>;
}

export interface BaseCalloutViewProps extends CoreEntityIdTypes, CalloutLayoutEvents, Partial<CalloutSortProps> {
  calloutNames: string[];
  contributionsCount: number;
  loading?: boolean;
  canCreate?: boolean;
  expanded?: boolean;
  calloutUri: string;
  onExpand?: () => void;
  onClose?: () => void;
}
