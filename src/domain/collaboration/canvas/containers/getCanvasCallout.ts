import { CalloutType, CanvasDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
// temp function used in the transition period for switching to collaboration; for choosing the correct callout by type
export const getCanvasCallout = <T extends { type: CalloutType; nameID: string }>(
  callouts: T[] | undefined,
  calloutNameId: string
) => callouts?.find(x => x.type === CalloutType.Canvas && x.nameID === calloutNameId);

export const getCanvasCalloutContainingCanvas = <
  A extends { id: string },
  T extends { type: CalloutType; canvases?: A[] }
>(
  canvases: T[] | undefined,
  canvasId: string
) => canvases?.find(x => x.type === CalloutType.Canvas && x.canvases?.some(x => x.id === canvasId));

export const getAllCanvasesOnCallouts = <T extends { type: CalloutType; canvases?: CanvasDetailsFragment[] }>(
  callouts: T[] | undefined
) => {
  const filteredCallouts = callouts?.filter(x => x.type === CalloutType.Canvas) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currCanvases = curr?.canvases ?? [];
    return [...acc, ...currCanvases];
  }, [] as CanvasDetailsFragment[]);
};
