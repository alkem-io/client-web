import React, { FC, useContext } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { usePostProviderQuery } from '@/core/apollo/generated/apollo-hooks';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';

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
  const { postNameId } = useUrlParams();

  const { calloutId } = useRouteResolver();

  const { data, loading, error } = usePostProviderQuery({
    variables: {
      postNameId: postNameId!,
      calloutId: calloutId!,
    },
    skip: !calloutId || !postNameId,
  });

  const parentCallout = data?.lookup.callout;

  const post = parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId)?.post;

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
