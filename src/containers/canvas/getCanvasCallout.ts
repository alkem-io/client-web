import { CalloutType, CanvasDetailsFragment } from '../../models/graphql-schema';
// temp function used in the transition period for switching to collaboration; for choosing the correct callout by type
export const getCanvasCallout = <A extends { nameID: string }, T extends { type: CalloutType; canvases?: A[] }>(
  canvases: T[] | undefined,
  canvasNameID: string
) => canvases?.find(x => x.type === CalloutType.Canvas && x.canvases?.some(x => x.nameID === canvasNameID));

export const getCanvasCallouts = <T extends { type: CalloutType }>(callouts: T[] | undefined) =>
  callouts?.filter(x => x.type === CalloutType.Canvas);

export const getAllCanvasesOnCallouts = <T extends { type: CalloutType; canvases?: CanvasDetailsFragment[] }>(
  callouts: T[] | undefined
) => callouts?.filter(x => x.type === CalloutType.Canvas).map(x => x.canvases);
