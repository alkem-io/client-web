import { WhiteboardFragmentWithCallout } from '../useCallouts/useCallouts';

type NeededFields = 'id' | 'nameID' | 'profile' | 'calloutNameId' | 'createdDate';

export type WhiteboardCardWhiteboard = Pick<WhiteboardFragmentWithCallout, NeededFields>;
