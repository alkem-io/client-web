import type { NavigationState } from '@/core/routing/ScrollToTop';
import type { CalloutDetailsModelExtended } from '../callout/models/CalloutDetailsModel';

export const LocationStateKeyCachedCallout = 'LocationStateKeyCachedCallout';

export interface LocationStateCachedCallout extends NavigationState {
  [LocationStateKeyCachedCallout]?: CalloutDetailsModelExtended;
}
