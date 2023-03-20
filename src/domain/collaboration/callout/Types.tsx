import { Callout, CalloutVisibility } from '../../../core/apollo/generated/graphql-schema';
import { CalloutEditType } from './edit/CalloutEditType';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';

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
  onVisibilityChange: (calloutId: Callout['id'], visibility: CalloutVisibility) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  onCalloutDelete: (callout: CalloutEditType) => Promise<void>;
}

export interface BaseCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  calloutNames: string[];
  contributionsCount: number;
  loading?: boolean;
  canCreate?: boolean;
}
