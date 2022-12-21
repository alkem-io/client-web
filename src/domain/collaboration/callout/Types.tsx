import { Callout, CalloutVisibility } from '../../../core/apollo/generated/graphql-schema';
import { CalloutEditType } from './edit/CalloutEditType';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';

export interface CalloutLayoutEvents {
  onVisibilityChange: (calloutId: Callout['id'], visibility: CalloutVisibility) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  onCalloutDelete: (callout: CalloutEditType) => Promise<void>;
}

export interface BaseCalloutImpl extends OptionalCoreEntityIds, CalloutLayoutEvents {
  calloutNames: string[];
  contributionsCount: number;
  loading?: boolean;
  canCreate?: boolean;
}
