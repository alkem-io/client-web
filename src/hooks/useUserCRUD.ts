import { ApolloError, gql } from '@apollo/client';
import { useState } from 'react';
import { useCreateUserMutation, useRemoveUserMutation, UserInput, useUpdateUserMutation } from '../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../graphql/user';

export const useUserCRUD = () => {
  const [status, setStatus] = useState<'success' | 'error' | undefined>();
  const [message, setMessage] = useState<string | undefined>(undefined);

  const handleError = (error: ApolloError) => {
    setStatus('error');
    setMessage(error.message);
    console.error(error);
  };

  const [updateUserMutation, { loading: updateUserLoading }] = useUpdateUserMutation({
    onError: handleError,
    onCompleted: () => {
      setMessage('User updated sucessfully');
      setStatus('success');
    },
  });

  const [createUserMutation, { loading: createUserLoading }] = useCreateUserMutation({
    onError: handleError,
    onCompleted: data => {
      setStatus('success');
      setMessage('User save successfuly!');
    },
    update: (cache, { data }) => {
      if (data) {
        const { createUser } = data;

        cache.modify({
          fields: {
            users(existingUsers = []) {
              const newUserRef = cache.writeFragment({
                data: createUser,
                fragment: gql`
                  ${USER_DETAILS_FRAGMENT}
                `,
              });
              return [...existingUsers, newUserRef];
            },
          },
        });
      }
    },
  });

  const [removeUserMutation, { loading: removeUserLoading }] = useRemoveUserMutation({
    refetchQueries: ['users'],
    awaitRefetchQueries: true,
    onError: handleError,
  });

  const createUser = (user: UserInput) => {
    return createUserMutation({
      variables: {
        user,
      },
    });
  };

  const updateUser = (id: string, user: UserInput) => {
    const { email: _email, ...userToUpdate } = user;

    return updateUserMutation({
      variables: {
        userId: Number(id),
        user: userToUpdate,
      },
    });
  };

  const removeUser = (id: string) => {
    return removeUserMutation({
      variables: {
        userID: Number(id),
      },
    });
  };

  return {
    createUser,
    updateUser,
    removeUser,
    message,
    status,
    loading: createUserLoading || updateUserLoading || removeUserLoading,
  };
};
