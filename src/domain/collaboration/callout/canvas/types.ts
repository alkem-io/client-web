import { CanvasFragmentWithCallout } from '../useCallouts/useCallouts';

type NeededFields = 'id' | 'nameID' | 'profile' | 'calloutNameId' | 'createdDate';

export type CanvasCardCanvas = Pick<CanvasFragmentWithCallout, NeededFields>;
