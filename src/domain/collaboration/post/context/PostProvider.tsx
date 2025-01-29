import React, { FC, useContext } from 'react';
import { usePostProviderQuery } from '@/core/apollo/generated/apollo-hooks';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';

interface PostPermissions {
  canUpdate: boolean;
}

type PostContextProps = {
  id?: string;
  nameId?: string;
  displayName?: string;
  permissions: PostPermissions;
  loading: boolean;
  error?: ApolloError;
};

const PostContext = React.createContext<PostContextProps>({
  loading: false,
  permissions: {
    canUpdate: true,
  },
});

const PostProvider: FC = ({ children }) => {
  const { postId } = useUrlResolver();

  const { data, loading, error } = usePostProviderQuery({
    variables: {
      postId: postId!,
    },
    skip: !postId,
  });

  const post = data?.lookup.post;

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
