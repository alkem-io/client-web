import React, { FC } from 'react';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useEcoverse } from '../../hooks';
import { useCommunityDiscussionListQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { DiscussionDetailsFragment } from '../../models/graphql-schema';

export interface DiscussionListEntities {
  discussionList: DiscussionDetailsFragment[];
}
export interface DiscussionListState {
  loading: boolean;
}
export interface DiscussionListActions {}

export interface DiscussionListContainerProps
  extends ContainerProps<DiscussionListEntities, DiscussionListActions, DiscussionListState> {}

const DiscussionListContainer: FC<DiscussionListContainerProps> = ({ children }) => {
  const { ecoverseNameId, loading: loadingEcoverse } = useEcoverse();
  const { communityId, loading: loadingCommunity } = useCommunityContext();

  const { data, loading: loadingDiscussionList } = useCommunityDiscussionListQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      communityId: communityId || '',
    },
    skip: !ecoverseNameId || !communityId,
  });

  return (
    <>
      {children(
        {
          discussionList: data?.ecoverse.community?.communication?.discussions || [],
        },
        {
          loading: loadingEcoverse || loadingCommunity || loadingDiscussionList,
        },
        {}
      )}
    </>
  );
};
export default DiscussionListContainer;
