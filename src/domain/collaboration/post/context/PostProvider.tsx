import React, { FC, useContext } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengePostProviderQuery,
  useHubPostProviderQuery,
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
    hubNameId = '',
    challengeNameId = '',
    opportunityNameId = '',
    postNameId = '',
    calloutNameId = '',
  } = useUrlParams();

  const isPostDefined = postNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubPostProviderQuery({
    variables: { hubNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !!(challengeNameId || opportunityNameId),
  });
  const hubPost = getCardCallout(hubData?.hub?.collaboration?.callouts, postNameId)?.posts?.find(
    x => x.nameID === postNameId
  );
  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengePostProviderQuery({
    variables: { hubNameId, challengeNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !challengeNameId || !!opportunityNameId,
  });
  const challengePost = getCardCallout(challengeData?.hub?.challenge?.collaboration?.callouts, postNameId)?.posts?.find(
    x => x.nameID === postNameId
  );

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityPostProviderQuery({
    variables: { hubNameId, opportunityNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !opportunityNameId,
  });
  const opportunityPost = getCardCallout(
    opportunityData?.hub?.opportunity?.collaboration?.callouts,
    postNameId
  )?.posts?.find(x => x.nameID === postNameId);

  const post = hubPost ?? challengePost ?? opportunityPost;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

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
