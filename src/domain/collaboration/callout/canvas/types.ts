import { CanvasFragmentWithCallout } from '../useCallouts';

type NeededFields = 'id' | 'nameID' | 'displayName' | 'preview' | 'calloutNameId' | 'createdDate';

export type CanvasCardCanvas = Pick<CanvasFragmentWithCallout, NeededFields>;
