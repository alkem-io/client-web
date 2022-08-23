import {
  AspectCardFragment,
  CalloutType,
  CalloutVisibility,
  CanvasDetailsFragment,
} from '../../../models/graphql-schema';

export const getAspectsFromPublishedCallouts = <
  T extends { type: CalloutType; visibility: CalloutVisibility; aspects?: AspectCardFragment[] }
>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.Card && x.visibility === CalloutVisibility.Published) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currAspects = curr?.aspects ?? [];
    return [...acc, ...currAspects];
  }, [] as AspectCardFragment[]);
};

export const getCanvasesFromPublishedCallouts = <
  T extends { type: CalloutType; visibility: CalloutVisibility; canvases?: CanvasDetailsFragment[] }
>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.Canvas && x.visibility === CalloutVisibility.Published) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currCanvases = curr?.canvases ?? [];
    return [...acc, ...currCanvases];
  }, [] as CanvasDetailsFragment[]);
};
