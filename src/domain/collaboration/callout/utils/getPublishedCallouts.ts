import {
  AspectCardFragment,
  CalloutType,
  CalloutVisibility,
  CanvasDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../useCallouts';

// These are two utility functions to reduce an array of callouts with an inside array of aspects/canvases
// and flatten them into a single array of (AspectCardFragment & { calloutNameId: string}) or (CanvasDetailsFragment & { calloutNameId: string})

export const getAspectsFromPublishedCallouts = <
  T extends { nameID: string; type: CalloutType; visibility: CalloutVisibility; aspects?: AspectCardFragment[] }
>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.Card && x.visibility === CalloutVisibility.Published) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currAspects = curr?.aspects ?? [];
    const allAspects = [...acc, ...currAspects];
    return allAspects.map(aspect => {
      return { calloutNameId: curr!.nameID, ...aspect };
    });
  }, [] as AspectFragmentWithCallout[]);
};

export const getCanvasesFromPublishedCallouts = <
  T extends { nameID: string; type: CalloutType; visibility: CalloutVisibility; canvases?: CanvasDetailsFragment[] }
>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.Canvas && x.visibility === CalloutVisibility.Published) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currCanvases = curr?.canvases ?? [];
    const allCanvases = [...acc, ...currCanvases];
    return allCanvases.map(canvas => {
      return { calloutNameId: curr!.nameID, ...canvas };
    });
  }, [] as CanvasFragmentWithCallout[]);
};
