import { CalloutType, WhiteboardDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
// temp function used in the transition period for switching to collaboration; for choosing the correct callout by type
export const getWhiteboardCallout = <T extends { type: CalloutType; nameID: string }>(
  callouts: T[] | undefined,
  calloutNameId: string
) =>
  callouts?.find(
    x =>
      (x.type === CalloutType.WhiteboardCollection || x.type === CalloutType.Whiteboard) && x.nameID === calloutNameId
  );

export const getWhiteboardCalloutContainingWhiteboard = <
  A extends { id: string },
  T extends { type: CalloutType; whiteboards?: A[] }
>(
  whiteboards: T[] | undefined,
  whiteboardId: string
) =>
  whiteboards?.find(
    x =>
      (x.type === CalloutType.WhiteboardCollection || x.type === CalloutType.Whiteboard) &&
      x.whiteboards?.some(x => x.id === whiteboardId)
  );

export const getAllWhiteboardsOnCallouts = <T extends { type: CalloutType; whiteboards?: WhiteboardDetailsFragment[] }>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.WhiteboardCollection || x.type === CalloutType.Whiteboard) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currWhiteboards = curr?.whiteboards ?? [];
    return [...acc, ...currWhiteboards];
  }, [] as WhiteboardDetailsFragment[]);
};
