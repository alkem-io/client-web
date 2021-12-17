import { useMemo } from 'react';
import { useSelector } from '@xstate/react';
import { unionWith, uniqBy } from 'lodash';
import { useGlobalState } from '../useGlobalState';
import { Message } from '../../models/graphql-schema';

const useCommunityDiscussionSubscriptionSelector = (initialComments?: Message[], discussionID?: string) => {
  const {
    entities: { communityDiscussionService },
  } = useGlobalState();

  const messages: Message[] =
    useSelector(communityDiscussionService, state => state.context.commentsByDiscussion[discussionID ?? '']) ?? [];

  return useMemo(() => {
    // merge them based on timestamp... unfortunately there is an ID mismatch when
    // an event is reported live against an event retrieved from a room api
    const mergedMessages = unionWith(messages, initialComments, (x1, x2) => x1.timestamp === x2.timestamp);
    return uniqBy(mergedMessages, x => x.timestamp);
  }, [initialComments, messages]);
};
export default useCommunityDiscussionSubscriptionSelector;
