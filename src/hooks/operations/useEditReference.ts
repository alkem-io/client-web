import { ApolloError } from '@apollo/client';
import { useRef } from 'react';
import {
  useCreateReferenceOnAspectMutation,
  useCreateReferenceOnContextMutation,
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
} from '../generated/graphql';
import { useApolloErrorHandler } from '../graphql/useApolloErrorHandler';

export type PushFunc = (success: boolean) => void;
export type RemoveFunc = (obj?: any) => void;
export type AddReferenceFunc = (reference: {
  aspectId?: string;
  contextId?: string;
  profileId?: string;
  name: string;
  uri?: string;
  description?: string;
}) => void;

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

  const [addReferenceOnAspect] = useCreateReferenceOnAspectMutation({
    onError: handleError,
    onCompleted: data => {
      if (push.current) {
        push.current({
          id: data?.createReferenceOnAspect.id,
          name: data?.createReferenceOnAspect.name,
          uri: data?.createReferenceOnAspect.uri,
        });
      }
    },
  });

  const [deleteReferenceInt] = useDeleteReferenceMutation({
    onError: err => {
      remove.current && remove.current(false);
      handleError(err);
    },
    onCompleted: () => remove.current && remove.current(true),
    //update: removeFromCache,
  });

  const setPush = (pushFn: PushFunc) => {
    push.current = pushFn;
  };

  const setRemove = (removeFn: RemoveFunc) => {
    remove.current = removeFn;
  };

  const addReference: AddReferenceFunc = ({ aspectId, contextId, profileId, name, uri = '', description = '' }) => {
    if (contextId) {
      addReferenceOnContext({
        variables: {
          input: {
            contextID: contextId,
            name: name,
            description: description,
            uri: uri,
          },
        },
      });
    }

    if (profileId) {
      addReferenceOnProfile({
        variables: {
          input: {
            profileID: profileId,
            name: name,
            description: description,
            uri: uri,
          },
        },
      });
    }

    if (aspectId) {
      addReferenceOnAspect({
        variables: {
          referenceInput: {
            aspectID: aspectId,
            name: name,
            description: description,
            uri: uri,
          },
        },
      });
    }
  };

  const deleteReference = (id: string) => {
    deleteReferenceInt({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  return {
    addReference,
    deleteReference,
    setPush,
    setRemove,
  };
};
