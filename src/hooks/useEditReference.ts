import { ApolloError } from '@apollo/client';
import { useRef } from 'react';
import {
  useCreateReferenceOnContextMutation,
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
} from '../generated/graphql';
import { useApolloErrorHandler } from './useApolloErrorHandler';

export type PushFunc = (success: boolean) => void;
export type RemoveFunc = (obj?: any) => void;

export const useEditReference = () => {
  const remove = useRef<PushFunc | undefined>();
  const push = useRef<RemoveFunc | undefined>();
  const handleApolloError = useApolloErrorHandler();

  const handleError = (err: ApolloError) => {
    push.current && push.current();
    handleApolloError(err);
  };

  const [addReferenceOnContext] = useCreateReferenceOnContextMutation({
    onError: handleError,
    onCompleted: data => {
      if (push.current) {
        push.current({
          id: data?.createReferenceOnContext.id,
          name: data?.createReferenceOnContext.name,
          uri: data?.createReferenceOnContext.uri,
        });
      }
    },
  });

  const [addReferenceOnProfile] = useCreateReferenceOnProfileMutation({
    onError: handleError,
    onCompleted: data => {
      if (push.current) {
        push.current({
          id: data?.createReferenceOnProfile.id,
          name: data?.createReferenceOnProfile.name,
          uri: data?.createReferenceOnProfile.uri,
        });
      }
    },
  });

  const [deleteReference] = useDeleteReferenceMutation({
    onError: err => {
      remove.current && remove.current(false);
      handleError(err);
    },
    onCompleted: () => remove.current && remove.current(true),
  });

  const setPush = (pushFn: PushFunc) => {
    push.current = pushFn;
  };

  const setRemove = (removeFn: RemoveFunc) => {
    remove.current = removeFn;
  };

  return {
    addReferenceOnContext,
    addReferenceOnProfile,
    deleteReference,
    setPush,
    setRemove,
  };
};
