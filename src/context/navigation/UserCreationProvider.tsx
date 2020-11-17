import { ApolloError, FetchResult, gql } from '@apollo/client';
import generator from 'generate-password';
import React, { FC, useEffect, useState } from 'react';

import {
  CreateUserMutation,
  RemoveUserMutation,
  UpdateUserMutation,
  useCreateUserMutation,
  useRemoveUserMutation,
  UserInput,
  useUpdateUserMutation,
} from '../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../graphql/user';

export interface UserCreationContextResult {
  password: string;
  createUser: (
    user: UserInput
  ) => Promise<FetchResult<CreateUserMutation, Record<string, any>, Record<string, any>> | undefined>;
  updateUser: (
    id: string,
    user: UserInput
  ) => Promise<FetchResult<UpdateUserMutation, Record<string, any>, Record<string, any>> | undefined>;
  removeUser: (
    id: string
  ) => Promise<FetchResult<RemoveUserMutation, Record<string, any>, Record<string, any>> | undefined>;
  isBlocked: boolean;
  message?: string;
  status?: 'success' | 'error';
  loading: boolean;
  confirm: () => void;
  dismiss: () => void;
}

const UserCreationContext = React.createContext<UserCreationContextResult>({
  password: '',
  createUser: (_user: UserInput) => Promise.resolve(undefined),
  updateUser: (_id: string, _user: UserInput) => Promise.resolve(undefined),
  removeUser: (_id: string) => Promise.resolve(undefined),
  isBlocked: false,
  loading: false,
  confirm: () => null,
  dismiss: () => null,
});

const UserCreationProvider: FC<{}> = ({ children }) => {
  const [status, setStatus] = useState<'success' | 'error' | undefined>();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    const handleUnload = e => {
      if (isBlocked) {
        const message =
          'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!';

        if (e) {
          e.preventDefault(); // Prevent navigation
          e.returnValue = message; // Works only for old browsers
        }
        return message; // Works only for the oldest browsers
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [isBlocked]);

  const handleError = (error: ApolloError) => {
    setStatus('error');
    setMessage(error.message);
    console.error('error');
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
      setIsBlocked(true);
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
    const passwordBase = generator.generate({
      length: 4,
      numbers: true,
      symbols: false,
      excludeSimilarCharacters: true,
      exclude: '"', // avoid causing invalid Json
      strict: true,
    });

    const aadPassword = `Cherrytwist-${passwordBase}!`;

    setPassword(aadPassword);

    const newUser = {
      ...user,
      aadPassword,
    };

    return createUserMutation({
      variables: {
        user: newUser,
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

  const confirm = () => {
    setPassword('');
    setIsBlocked(false);
  };

  const dismiss = () => {
    setStatus(undefined);
    setMessage(undefined);
  };

  return (
    <UserCreationContext.Provider
      value={{
        password,
        createUser,
        updateUser,
        removeUser,
        message,
        status,
        isBlocked,
        confirm,
        dismiss,
        loading: updateUserLoading || removeUserLoading || createUserLoading,
      }}
    >
      {children}
    </UserCreationContext.Provider>
  );
};

export { UserCreationProvider, UserCreationContext };
