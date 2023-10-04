import {
  PostCardFragment,
  CalloutType,
  CalloutVisibility,
  WhiteboardDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { PostFragmentWithCallout, WhiteboardFragmentWithCallout } from '../useCallouts/useCallouts';

// These are two utility functions to reduce an array of callouts with an inside array of posts/whiteboards
// and flatten them into a single array of (PostCardFragment & { calloutNameId: string}) or (WhiteboardDetailsFragment & { calloutNameId: string})

export const getPostsFromPublishedCallouts = <
  T extends { nameID: string; type: CalloutType; visibility: CalloutVisibility; posts?: PostCardFragment[] }
>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.Post && x.visibility === CalloutVisibility.Published) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currPosts = curr?.posts ?? [];
    const allPosts = [...acc, ...currPosts];
    return allPosts.map(post => ({ calloutNameId: curr!.nameID, ...post }));
  }, [] as PostFragmentWithCallout[]);
};

export const getWhiteboardsFromPublishedCallouts = <
  T extends {
    nameID: string;
    type: CalloutType;
    visibility: CalloutVisibility;
    whiteboards?: WhiteboardDetailsFragment[];
  }
>(
  callouts: T[] | undefined
) => {
  const filteredCallouts =
    callouts?.filter(x => x.type === CalloutType.Whiteboard && x.visibility === CalloutVisibility.Published) ?? [];
  return filteredCallouts.reduce((acc, curr) => {
    const currWhiteboards = curr?.whiteboards ?? [];
    const allWhiteboards = [...acc, ...currWhiteboards];
    return allWhiteboards.map(whiteboard => ({ calloutNameId: curr!.nameID, ...whiteboard }));
  }, [] as WhiteboardFragmentWithCallout[]);
};
