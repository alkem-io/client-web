import React, { FC, useContext } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengePostProviderQuery,
  useSpacePostProviderQuery,
  useOpportunityPostProviderQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { getCardCallout } from '../containers/getPostCallout';

interface PostPermissions {
  canUpdate: boolean;
}

interface PostContextProps {
  id?: string;
  nameId?: string;
  displayName?: string;
  permissions: PostPermissions;
  loading: boolean;
  error?: ApolloError;
}

const PostContext = React.createContext<PostContextProps>({
  loading: false,
  permissions: {
    canUpdate: true,
  },
});

const PostProvider: FC = ({ children }) => {
  const {
    spaceNameId = '',
    challengeNameId = '',
    opportunityNameId = '',
    postNameId = '',
    calloutNameId = '',
  } = useUrlParams();

  const isPostDefined = postNameId && spaceNameId;

  const {
    data: spaceData,
    loading: spaceLoading,
    error: spaceError,
  } = useSpacePostProviderQuery({
    variables: { spaceNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !!(challengeNameId || opportunityNameId),
  });
  const spacePostContribution = getCardCallout(
    spaceData?.space?.collaboration?.callouts,
    postNameId
  )?.contributions?.find(x => x.post && x.post.nameID === postNameId);
  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengePostProviderQuery({
    variables: { spaceNameId, challengeNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !challengeNameId || !!opportunityNameId,
  });
  const challengePostContribution = getCardCallout(
    challengeData?.space?.challenge?.collaboration?.callouts,
    postNameId
  )?.contributions?.find(x => x.post && x.post.nameID === postNameId);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityPostProviderQuery({
    variables: { spaceNameId, opportunityNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !opportunityNameId,
  });
  const opportunityPostContribution = getCardCallout(
    opportunityData?.space?.opportunity?.collaboration?.callouts,
    postNameId
  )?.contributions?.find(x => x.post && x.post.nameID === postNameId);

  const post = spacePostContribution?.post ?? challengePostContribution?.post ?? opportunityPostContribution?.post;
  const loading = spaceLoading || challengeLoading || opportunityLoading;
  const error = spaceError ?? challengeError ?? opportunityError;

  const myPrivileges = post?.authorization?.myPrivileges;
  const permissions: PostPermissions = {
    canUpdate: myPrivileges?.includes(AuthorizationPrivilege.Update) ?? true,
  };

  return (
    <PostContext.Provider
      value={{
        loading,
        error,
        id: post?.id,
        nameId: post?.nameID,
        displayName: post?.profile.displayName,
        permissions,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export default PostProvider;

export const usePost = () => useContext(PostContext);
