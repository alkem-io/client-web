import { useRef } from 'react';
import { useCreateReferenceOnProfileMutation, useDeleteReferenceMutation } from '@/core/apollo/generated/apollo-hooks';

export type PushFunc = (success: boolean) => void;
// TODO this hook needs refactoring - something weird is going on with types here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RemoveFunc = (obj?: any) => void;
export type AddReferenceFunc = (reference: {
  profileId?: string;
  name: string;
  uri?: string;
  description?: string;
}) => void;

// TODO Refactor. No refs to callback callbacks!
export const useEditReference = () => {
  const remove = useRef<PushFunc | undefined>(null);
  const push = useRef<RemoveFunc | undefined>(null);

  const handleError = () => {
    push.current && push.current();
  };

  const [addReferenceOnProfile] = useCreateReferenceOnProfileMutation({
    onCompleted: data => {
      if (push.current) {
        push.current({
          id: data?.createReferenceOnProfile.id,
          name: data?.createReferenceOnProfile.name,
          uri: data?.createReferenceOnProfile.uri,
        });
      }
    },
    onError: () => {
      handleError();
    },
  });

  const [deleteReferenceInt] = useDeleteReferenceMutation({
    onError: () => {
      remove.current && remove.current(false);
      handleError();
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

  const addReference: AddReferenceFunc = ({ profileId, name, uri = '', description = '' }) => {
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
